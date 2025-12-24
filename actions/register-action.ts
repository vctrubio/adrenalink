"use server";

/**
 * REGISTER ACTIONS
 *
 * Architecture Decision: Username → ID Lookup Pattern
 * ====================================================
 *
 * CONTEXT:
 * - Headers provide: x-school-username (string, unique)
 * - Database uses: schoolId (UUID) as foreign keys
 * - School table has: Both id (UUID PK) and username (unique varchar)
 *
 * DECISION: Use helper function pattern
 * - getSchoolIdFromHeader() converts username → ID
 * - All actions use this helper for school context
 * - Maintains relational integrity with UUID foreign keys
 *
 * WHY NOT username as FK?
 * ❌ Breaks normalization
 * ❌ Username changes would break all relations
 * ❌ Larger indexes (varchar vs UUID)
 * ❌ Poor performance on joins
 *
 * SCENARIOS HANDLED:
 * 1. Create student: No school context needed
 * 2. Link to school: Use getSchoolIdFromHeader() for schoolId
 * 3. Create + Link: Transaction ensures both succeed or both fail
 * 4. Query by school: Use getSchoolIdFromHeader() in where clause
 *
 * BENEFITS:
 * ✅ Single source of truth (headers)
 * ✅ Type-safe UUID foreign keys
 * ✅ Username can change without breaking relations
 * ✅ Follows relational best practices
 * ✅ Reusable helper across all actions
 */

import { db } from "@/drizzle/db";
import { student, schoolStudents, teacher, schoolPackage, teacherCommission, studentPackage, studentPackageStudent, booking, bookingStudent, lesson, referral, equipment } from "@/drizzle/schema";
import type { StudentForm, SchoolStudentForm, TeacherForm, SchoolPackageForm, TeacherCommissionForm, EquipmentForm } from "@/drizzle/schema";
import type { ApiActionResponseModel } from "@/types/actions";
import { getSchoolHeader } from "@/types/headers";

/**
 * Get school packages only if not already provided
 * Useful for sub-routes that may not have packages in context
 *
 * @param packages - Existing packages array (if any)
 * @returns Packages array (either provided or freshly fetched)
 */
export async function getSchoolPackagesIfNull(packages?: any[]): Promise<ApiActionResponseModel<any[]>> {
    // If packages already provided, return them
    if (packages && packages.length > 0) {
        return { success: true, data: packages };
    }

    // Otherwise, fetch from database
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found in headers" };
        }

        const packagesData = await db.query.schoolPackage.findMany({
            where: (fields, { eq }) => eq(fields.schoolId, schoolHeader.id),
            orderBy: (fields, { asc }) => [asc(fields.packageType), asc(fields.capacityStudents)],
        });

        return { success: true, data: packagesData };
    } catch (error) {
        console.error("Error fetching school packages:", error);
        return { success: false, error: "Failed to fetch school packages" };
    }
}

/**
 * Create a new student
 * Creates a student entity with personal information
 *
 * @param studentData - Student information (firstName, lastName, passport, etc.)
 * @returns Created student record
 */
export async function createStudent(studentData: StudentForm): Promise<ApiActionResponseModel<typeof student.$inferSelect>> {
    try {
        const result = await db.insert(student).values(studentData).returning();
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error creating student:", error);

        // Provide more detailed error message
        let errorMessage = "Failed to create student";
        if (error instanceof Error) {
            errorMessage += `: ${error.message}`;
        }

        return { success: false, error: errorMessage };
    }
}

/**
 * Link student to school
 * Creates the school_students relationship using the x-school-username header
 *
 * @param studentId - The student ID to link
 * @param canRent - Whether student can rent equipment (maps to 'rental' field)
 * @param description - Optional description/notes about the student
 * @returns Created school_students record
 */
export async function linkStudentToSchool(studentId: string, canRent = false, description?: string): Promise<ApiActionResponseModel<typeof schoolStudents.$inferSelect>> {
    try {
        // Get school ID from header
        const schoolHeader = await getSchoolHeader();

        if (!schoolHeader) {
            return { success: false, error: "School not found in headers" };
        }

        const schoolStudentData: SchoolStudentForm = {
            schoolId: schoolHeader.id,
            studentId,
            description: description || null,
            active: true,
            rental: canRent,
        };

        const result = await db.insert(schoolStudents).values(schoolStudentData).returning();
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error linking student to school:", error);

        // Provide more detailed error message
        let errorMessage = "Failed to link student to school";
        if (error instanceof Error) {
            errorMessage += `: ${error.message}`;
        }

        return { success: false, error: errorMessage };
    }
}

/**
 * Create student and link to school in a single transaction
 * This is the recommended way to create a student from the register form
 *
 * @param studentData - Student information
 * @param canRent - Whether student can rent equipment
 * @param description - Optional description
 * @returns Object with both student and school_students records
 */
export async function createAndLinkStudent(
    studentData: StudentForm,
    canRent = false,
    description?: string,
): Promise<
    ApiActionResponseModel<{
        student: typeof student.$inferSelect;
        schoolStudent: typeof schoolStudents.$inferSelect;
    }>
> {
    try {
        // Get school context from header first
        const schoolHeader = await getSchoolHeader();

        if (!schoolHeader) {
            return { success: false, error: "School not found in headers - check x-school-username header" };
        }

        // Debug logging
        console.log("Creating student with data:", {
            ...studentData,
            languages: studentData.languages,
            languagesType: typeof studentData.languages,
            isArray: Array.isArray(studentData.languages),
        });

        // Use transaction to ensure both operations succeed or both fail
        const result = await db.transaction(async (tx) => {
            // Create student
            const [createdStudent] = await tx.insert(student).values(studentData).returning();

            // Link to school
            const schoolStudentData: SchoolStudentForm = {
                schoolId: schoolHeader.id,
                studentId: createdStudent.id,
                description: description || null,
                active: true,
                rental: canRent,
            };

            const [createdSchoolStudent] = await tx.insert(schoolStudents).values(schoolStudentData).returning();

            return {
                student: createdStudent,
                schoolStudent: createdSchoolStudent,
            };
        });

        return { success: true, data: result };
    } catch (error) {
        console.error("Error creating and linking student:", error);

        // Provide detailed error message
        let errorMessage = "Failed to create and link student";
        if (error instanceof Error || (typeof error === "object" && error !== null)) {
            const err = error as any;
            // Check for common database errors
            if (err.code === "23503" || err.message?.includes("foreign key constraint")) {
                errorMessage = "School ID not found in database for the provided header.";
            } else if (err.code === "23505" || err.message?.includes("unique constraint")) {
                errorMessage = "Student with this passport already exists";
            } else {
                errorMessage += `: ${err.message || JSON.stringify(err)}`;
            }
        }

        return { success: false, error: errorMessage };
    }
}

/**
 * ============================================================================
 * TEACHER ACTIONS
 * ============================================================================
 */

/**
 * Create and link teacher to school with commission
 * Teachers are always linked to a school (schoolId is required in schema)
 * Creates both teacher and their commission structure in a transaction
 *
 * @param teacherData - Teacher information (firstName, lastName, username, passport, etc.)
 * @param commissionData - Commission information (type, value, description)
 * @returns Created teacher record with commission
 */
export async function createAndLinkTeacher(
    teacherData: Omit<TeacherForm, "schoolId">,
    commissionsData: {
        commissionType: "fixed" | "percentage";
        commissionValue: number;
        commissionDescription?: string;
    }[],
): Promise<
    ApiActionResponseModel<{
        teacher: typeof teacher.$inferSelect;
        commissions: (typeof teacherCommission.$inferSelect)[];
    }>
> {
    try {
        // Get school ID from header
        const schoolHeader = await getSchoolHeader();

        if (!schoolHeader) {
            return { success: false, error: "School not found in headers - check x-school-username header" };
        }

        // Use transaction to ensure teacher and all commissions are created atomically
        const result = await db.transaction(async (tx) => {
            // Create teacher with schoolId
            const completeTeacherData: TeacherForm = {
                ...teacherData,
                schoolId: schoolHeader.id,
            };

            const [createdTeacher] = await tx.insert(teacher).values(completeTeacherData).returning();

            // Create all commissions for the teacher
            const createdCommissions: (typeof teacherCommission.$inferSelect)[] = [];

            for (const commissionData of commissionsData) {
                const commissionFormData: TeacherCommissionForm = {
                    teacherId: createdTeacher.id,
                    commissionType: commissionData.commissionType,
                    cph: commissionData.commissionValue.toString(), // cph is decimal, stored as string
                    description: commissionData.commissionDescription || null,
                };

                const [createdCommission] = await tx.insert(teacherCommission).values(commissionFormData).returning();
                createdCommissions.push(createdCommission);
            }

            return {
                teacher: createdTeacher,
                commissions: createdCommissions,
            };
        });

        return { success: true, data: result };
    } catch (error) {
        console.error("Error creating teacher:", error);

        // Provide detailed error message
        let errorMessage = "Failed to create teacher";
        if (error instanceof Error || (typeof error === "object" && error !== null)) {
            const err = error as any;
            // Check for common database errors
            if (err.code === "23503" || err.message?.includes("foreign key constraint")) {
                errorMessage = "School ID not found in database for the provided header.";
            } else if (err.code === "23505" || err.message?.includes("unique constraint")) {
                if (err.message?.includes("passport")) {
                    errorMessage = "Teacher with this passport already exists";
                } else if (err.message?.includes("username")) {
                    errorMessage = "Teacher with this username already exists for this school";
                } else {
                    errorMessage = "Teacher with this information already exists";
                }
            } else {
                errorMessage += `: ${err.message || JSON.stringify(err)}`;
            }
        }

        return { success: false, error: errorMessage };
    }
}

/**
 * ============================================================================
 * PACKAGE ACTIONS
 * ============================================================================
 */

/**
 * Create and link package to school
 * Packages are always linked to a school (schoolId is required in schema)
 *
 * @param packageData - Package information (duration, price, capacity, etc.)
 * @returns Created package record
 */
export async function createSchoolPackage(packageData: Omit<SchoolPackageForm, "schoolId">): Promise<ApiActionResponseModel<typeof schoolPackage.$inferSelect>> {
    try {
        // Get school ID from header
        const schoolHeader = await getSchoolHeader();

        console.log("Creating package school HEader DEBUG..........:", schoolHeader);
        if (!schoolHeader) {
            return { success: false, error: "School not found in headers - check x-school-username header" };
        }

        // Create package with schoolId
        const completePackageData: SchoolPackageForm = {
            ...packageData,
            schoolId: schoolHeader.id,
        };

        const [createdPackage] = await db.insert(schoolPackage).values(completePackageData).returning();

        return { success: true, data: createdPackage };
    } catch (error) {
        console.error("Error creating package:", error);

        // Provide detailed error message
        let errorMessage = "Failed to create package";
        if (error instanceof Error || (typeof error === "object" && error !== null)) {
            const err = error as any;
            // Check for common database errors
            if (err.code === "23503" || err.message?.includes("foreign key constraint")) {
                errorMessage = "School ID not found in database for the provided header.";
            } else {
                errorMessage += `: ${err.message || JSON.stringify(err)}`;
            }
        }

        return { success: false, error: errorMessage };
    }
}

/**
 * ============================================================================
 * EQUIPMENT ACTIONS
 * ============================================================================
 */

/**
 * Create and link equipment to school
 * Equipment is always linked to a school (schoolId is required in schema)
 *
 * @param equipmentData - Equipment information (category, sku, model, color, size, status)
 * @returns Created equipment record
 */
export async function createSchoolEquipment(equipmentData: Omit<EquipmentForm, "schoolId">): Promise<ApiActionResponseModel<typeof equipment.$inferSelect>> {
    try {
        // Get school ID from header
        const schoolHeader = await getSchoolHeader();

        if (!schoolHeader) {
            return { success: false, error: "School not found in headers - check x-school-username header" };
        }

        // Create equipment with schoolId
        const completeEquipmentData: EquipmentForm = {
            ...equipmentData,
            schoolId: schoolHeader.id,
        };

        const [createdEquipment] = await db.insert(equipment).values(completeEquipmentData).returning();

        return { success: true, data: createdEquipment };
    } catch (error) {
        console.error("Error creating equipment:", error);

        // Provide detailed error message
        let errorMessage = "Failed to create equipment";
        if (error instanceof Error || (typeof error === "object" && error !== null)) {
            const err = error as any;
            // Check for common database errors
            if (err.code === "23503" || err.message?.includes("foreign key constraint")) {
                errorMessage = "School ID not found in database for the provided header.";
            } else {
                errorMessage += `: ${err.message || JSON.stringify(err)}`;
            }
        }

        return { success: false, error: errorMessage };
    }
}

/**
 * ============================================================================
 * MASTER BOOKING ACTIONS
 * ============================================================================
 */

/**
 * Master Booking Add
 * Create a complete booking flow: studentPackage → booking → lesson (if teacher provided)
 * This is used for testing and for the MasterBookingForm in the register page
 *
 * @param packageId - The school package ID
 * @param studentIds - Array of student IDs to link to the booking
 * @param dateStart - Booking start date
 * @param dateEnd - Booking end date
 * @param teacherId - Optional teacher ID (if provided, creates a lesson)
 * @param commissionId - Optional commission ID (required if teacherId provided)
 * @param referralId - Optional referral ID to track referral commissions
 * @param leaderStudentName - Name of the leader student (first and last name)
 * @returns Booking with lesson (if created)
 */
export async function masterBookingAdd(
    packageId: string,
    studentIds: string[],
    dateStart: string,
    dateEnd: string,
    teacherId?: string,
    commissionId?: string,
    referralId?: string,
    leaderStudentName?: string,
): Promise<
    ApiActionResponseModel<{
        booking: typeof booking.$inferSelect;
        lesson?: typeof lesson.$inferSelect;
    }>
> {
    try {
        console.log("🎫 [masterBookingAdd] Starting booking creation with:", {
            packageId,
            studentIds,
            dateStart,
            dateEnd,
            teacherId,
            commissionId,
            referralId,
            leaderStudentName,
        });

        // Get school ID from header
        const schoolHeader = await getSchoolHeader();

        if (!schoolHeader) {
            console.error("🎫 [masterBookingAdd] ❌ School ID not found in headers");
            return { success: false, error: "School not found in headers - check x-school-username header" };
        }

        console.log("🎫 [masterBookingAdd] ✅ School ID found:", schoolHeader.id);

        if (studentIds.length === 0) {
            return { success: false, error: "At least one student is required" };
        }

        if (teacherId && !commissionId) {
            return { success: false, error: "Commission ID is required when teacher is provided" };
        }

        // Convert to Date objects for database storage
        const dateStartTimestamp = new Date(dateStart);
        const dateEndTimestamp = new Date(dateEnd);

        console.log("🎫 [masterBookingAdd] Converted timestamps:", {
            dateStartInput: dateStart,
            dateStartTimestamp: dateStartTimestamp.toISOString(),
            dateEndInput: dateEnd,
            dateEndTimestamp: dateEndTimestamp.toISOString(),
        });

        // Start transaction
        const result = await db.transaction(async (tx) => {
            // 1. Create studentPackage (minimal - dates and wallet match booking)
            const [createdStudentPackage] = await tx
                .insert(studentPackage)
                .values({
                    schoolPackageId: packageId,
                    walletId: "00000000-0000-0000-0000-000000000000",
                    requestedDateStart: dateStartTimestamp.toISOString(),
                    requestedDateEnd: dateEndTimestamp.toISOString(),
                    status: "accepted",
                    referralId: referralId || null,
                })
                .returning();

            console.log(`📦 [masterBookingAdd] Created studentPackage: ${createdStudentPackage.id}`);

            // 2. Link students to studentPackage
            for (const studentId of studentIds) {
                await tx.insert(studentPackageStudent).values({
                    studentPackageId: createdStudentPackage.id,
                    studentId,
                });
            }

            console.log(`👥 [masterBookingAdd] Linked ${studentIds.length} students to studentPackage`);

            // 3. Create booking
            const [createdBooking] = await tx
                .insert(booking)
                .values({
                    schoolId: schoolHeader.id,
                    studentPackageId: createdStudentPackage.id,
                    dateStart: dateStartTimestamp.toISOString(),
                    dateEnd: dateEndTimestamp.toISOString(),
                    status: "active",
                    leaderStudentName: leaderStudentName || "",
                })
                .returning();

            console.log(`📅 [masterBookingAdd] Created booking: ${createdBooking.id}`);

            // 4. Link students to booking
            for (const studentId of studentIds) {
                await tx.insert(bookingStudent).values({
                    bookingId: createdBooking.id,
                    studentId,
                });
            }

            console.log(`👥 [masterBookingAdd] Linked ${studentIds.length} students to booking`);

            // 5. Create lesson if teacher provided
            let createdLesson: typeof lesson.$inferSelect | undefined;
            if (teacherId && commissionId) {
                const [newLesson] = await tx
                    .insert(lesson)
                    .values({
                        bookingId: createdBooking.id,
                        teacherId,
                        commissionId,
                        schoolId: schoolHeader.id,
                        status: "active",
                    })
                    .returning();

                createdLesson = newLesson;
                console.log(`📚 [masterBookingAdd] Created lesson: ${newLesson.id}`);
            }

            return {
                booking: createdBooking,
                lesson: createdLesson,
            };
        });

        console.log(`✅ [masterBookingAdd] Booking creation complete! Booking ID: ${result.booking.id}`);
        console.log("✅ [masterBookingAdd] Returning success response with data:", result);
        return { success: true, data: result };
    } catch (error) {
        console.error("❌ [masterBookingAdd] EXCEPTION in masterBookingAdd:", error);

        let errorMessage = "Failed to create booking";
        if (error instanceof Error || (typeof error === "object" && error !== null)) {
            const err = error as any;
            if (err.code === "23503" || err.message?.includes("foreign key constraint")) {
                errorMessage = "Invalid package, student, teacher, or commission ID";
            } else if (err.code === "23505" || err.message?.includes("unique constraint")) {
                errorMessage = "Duplicate booking entry";
            } else {
                errorMessage += `: ${err.message || JSON.stringify(err)}`;
            }
        }

        return { success: false, error: errorMessage };
    }
}
