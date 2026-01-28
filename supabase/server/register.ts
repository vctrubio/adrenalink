"use server";

import { revalidatePath } from "next/cache";
import type { ApiActionResponseModel } from "@/types/actions";
import { getServerConnection } from "@/supabase/connection";
import { getStudentBookingStatus } from "@/supabase/rpc/student_booking_status";
import { getSchoolHeader } from "@/types/headers";
import { handleSupabaseError, isUniqueConstraintError, safeArray } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

export interface StudentPayload {
    first_name: string;
    last_name: string;
    passport: string;
    country: string;
    phone: string;
    languages: string[];
}

export interface TeacherPayload {
    first_name: string;
    last_name: string;
    username: string;
    passport: string;
    country: string;
    phone: string;
    languages: string[];
}

export interface CommissionPayload {
    commission_type: "fixed" | "percentage";
    cph: string;
    description?: string;
}

export interface PackagePayload {
    duration_minutes: number;
    description: string;
    price_per_student: number;
    capacity_students?: number;
    capacity_equipment?: number;
    category_equipment: string;
    package_type: string;
    is_public?: boolean;
    active?: boolean;
}

/**
 * Create student and link to school in a single transaction
 */
export async function createAndLinkStudent(
    studentData: StudentPayload,
    canRent = false,
    description?: string,
): Promise<
    ApiActionResponseModel<{
        student: any;
        schoolStudent: any;
    }>
> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found. Invalid subdomain or missing headers." };
        }
        const schoolId = schoolHeader.id;

        const supabase = getServerConnection();

        // Create student
        const { data: createdStudent, error: studentError } = await supabase
            .from("student")
            .insert(studentData)
            .select()
            .single();

        if (studentError || !createdStudent) {
            if (isUniqueConstraintError(studentError)) {
                return { success: false, error: "Student with this passport already exists" };
            }
            return handleSupabaseError(studentError, "create student", "Failed to create student");
        }

        // Link to school
        const { data: createdSchoolStudent, error: linkError } = await supabase
            .from("school_students")
            .insert({
                school_id: schoolId,
                student_id: createdStudent.id,
                description: description || null,
                active: true,
                rental: canRent,
            })
            .select()
            .single();

        if (linkError || !createdSchoolStudent) {
            return handleSupabaseError(linkError, "link student to school", "Failed to link student to school");
        }

        logger.info("Created and linked student", { studentId: createdStudent.id, schoolId });

        revalidatePath("/students");
        revalidatePath("/register");

        return {
            success: true,
            data: {
                student: createdStudent,
                schoolStudent: createdSchoolStudent,
            },
        };
    } catch (error) {
        logger.error("Error creating and linking student", error);
        return { success: false, error: "Failed to create and link student" };
    }
}

/**
 * Create and link teacher to school with commissions
 */
export async function createAndLinkTeacher(
    teacherData: Omit<TeacherPayload, "schoolId">,
    commissionsData: CommissionPayload[],
): Promise<
    ApiActionResponseModel<{
        teacher: any;
        commissions: any[];
    }>
> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found. Invalid subdomain or missing headers." };
        }
        const schoolId = schoolHeader.id;

        const supabase = getServerConnection();

        // Create teacher
        const { data: createdTeacher, error: teacherError } = await supabase
            .from("teacher")
            .insert({
                ...teacherData,
                school_id: schoolId,
            })
            .select()
            .single();

        if (teacherError || !createdTeacher) {
            if (isUniqueConstraintError(teacherError)) {
                if (teacherError?.message?.includes("passport")) {
                    return { success: false, error: "Teacher with this passport already exists" };
                } else if (teacherError?.message?.includes("username")) {
                    return { success: false, error: "Teacher with this username already exists for this school" };
                }
            }
            return handleSupabaseError(teacherError, "create teacher", "Failed to create teacher");
        }

        // Create commissions
        const createdCommissions: any[] = [];
        for (const commissionData of commissionsData) {
            const { data: createdCommission, error: commissionError } = await supabase
                .from("teacher_commission")
                .insert({
                    teacher_id: createdTeacher.id,
                    commission_type: commissionData.commission_type,
                    cph: commissionData.cph,
                    description: commissionData.description || null,
                })
                .select()
                .single();

            if (commissionError || !createdCommission) {
                return handleSupabaseError(commissionError, "create teacher commission", "Failed to create teacher commissions");
            }

            createdCommissions.push(createdCommission);
        }

        logger.info("Created teacher with commissions", { teacherId: createdTeacher.id, commissionCount: createdCommissions.length });

        revalidatePath("/teachers");
        revalidatePath("/register");

        return {
            success: true,
            data: {
                teacher: createdTeacher,
                commissions: createdCommissions,
            },
        };
    } catch (error) {
        logger.error("Error creating teacher", error);
        return { success: false, error: "Failed to create teacher" };
    }
}

/**
 * Create school package
 */
export async function createSchoolPackage(packageData: PackagePayload): Promise<ApiActionResponseModel<any>> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found. Invalid subdomain or missing headers." };
        }
        const schoolId = schoolHeader.id;

        const supabase = getServerConnection();

        const { data: createdPackage, error } = await supabase
            .from("school_package")
            .insert({
                ...packageData,
                school_id: schoolId,
            })
            .select()
            .single();

        if (error || !createdPackage) {
            return handleSupabaseError(error, "create school package", "Failed to create package");
        }

        logger.info("Created school package", { packageId: createdPackage.id });

        revalidatePath("/packages");
        revalidatePath("/register");

        return { success: true, data: createdPackage };
    } catch (error) {
        logger.error("Error creating package", error);
        return { success: false, error: "Failed to create package" };
    }
}

/**
 * Create school equipment
 */
export async function createSchoolEquipment(equipmentData: {
    category: string;
    sku: string;
    model: string;
    color?: string;
    size?: number;
    status?: string;
}): Promise<ApiActionResponseModel<any>> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found. Invalid subdomain or missing headers." };
        }
        const schoolId = schoolHeader.id;

        const supabase = getServerConnection();

        const { data: createdEquipment, error } = await supabase
            .from("equipment")
            .insert({
                ...equipmentData,
                school_id: schoolId,
            })
            .select()
            .single();

        if (error || !createdEquipment) {
            return handleSupabaseError(error, "create equipment", "Failed to create equipment");
        }

        logger.info("Created equipment", { equipmentId: createdEquipment.id });

        revalidatePath("/equipments");
        revalidatePath("/register");

        return { success: true, data: createdEquipment };
    } catch (error) {
        logger.error("Error creating equipment", error);
        return { success: false, error: "Failed to create equipment" };
    }
}

/**
 * Master booking creation with students and optional lesson
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
        booking: any;
        lesson?: any;
    }>
> {
    try {
        if (studentIds.length === 0) {
            return { success: false, error: "At least one student is required" };
        }

        if (teacherId && !commissionId) {
            return { success: false, error: "Commission ID is required when teacher is provided" };
        }

        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found. Invalid subdomain or missing headers." };
        }
        const schoolId = schoolHeader.id;

        const supabase = getServerConnection();

        // Create booking
        const { data: createdBooking, error: bookingError } = await supabase
            .from("booking")
            .insert({
                school_id: schoolId,
                school_package_id: packageId,
                date_start: new Date(dateStart),
                date_end: new Date(dateEnd),
                leader_student_name: leaderStudentName || "",
                status: "active",
            })
            .select()
            .single();

        if (bookingError || !createdBooking) {
            return handleSupabaseError(bookingError, "create booking", "Failed to create booking");
        }

        // Link students to booking
        for (const studentId of studentIds) {
            const { error: linkError } = await supabase.from("booking_student").insert({
                booking_id: createdBooking.id,
                student_id: studentId,
            });

            if (linkError) {
                return handleSupabaseError(linkError, "link student to booking", "Failed to link students to booking");
            }
        }

        // Create lesson if teacher provided
        let createdLesson;
        if (teacherId && commissionId) {
            const { data: lesson, error: lessonError } = await supabase
                .from("lesson")
                .insert({
                    school_id: schoolId,
                    teacher_id: teacherId,
                    booking_id: createdBooking.id,
                    commission_id: commissionId,
                    status: "active",
                })
                .select()
                .single();

            if (lessonError) {
                return handleSupabaseError(lessonError, "create lesson", "Failed to create lesson");
            }

            createdLesson = lesson;
            
            // Revalidate teacher pages
            revalidatePath("/teachers");
            revalidatePath(`/teacher/${teacherId}`);
        }

        logger.info("Created booking with students", { bookingId: createdBooking.id, studentCount: studentIds.length, hasLesson: !!createdLesson });

        // Revalidate list pages
        revalidatePath("/students");
        revalidatePath("/packages");
        
        // Revalidate individual student pages (both user and admin routes) for all students in the booking
        for (const studentId of studentIds) {
            revalidatePath(`/student/${studentId}`);
            revalidatePath(`/student/${studentId}/bookings`);
            revalidatePath(`/students/${studentId}`); // Admin route
        }
        
        // Revalidate teacher page (both user and admin routes) if lesson was created
        if (teacherId) {
            revalidatePath(`/teacher/${teacherId}`);
            revalidatePath(`/teachers/${teacherId}`); // Admin route
        }
        
        // Revalidate package page (if it exists - using packageId)
        revalidatePath(`/packages/${packageId}`);

        return {
            success: true,
            data: {
                booking: createdBooking,
                lesson: createdLesson,
            },
        };
    } catch (error) {
        logger.error("Error creating booking", error);
        return { success: false, error: "Failed to create booking" };
    }
}

/**
 * Data type for register tables
 */
export interface RegisterTables {
    students: {
        id: string;
        studentId: string;
        description: string | null;
        active: boolean;
        rental: boolean;
        createdAt: string;
        student: {
            id: string;
            firstName: string;
            lastName: string;
            passport: string;
            country: string;
            phone: string;
            languages: string[];
        };
    }[];
    packages: {
        id: string;
        durationMinutes: number;
        description: string;
        pricePerStudent: number;
        capacityStudents: number;
        capacityEquipment: number;
        categoryEquipment: string;
        packageType: string;
        isPublic: boolean;
        active: boolean;
    }[];
    referrals: {
        id: string;
        code: string;
        commissionType: string;
        commissionValue: string;
        description: string | null;
        active: boolean;
    }[];
    studentBookingStats: Record<
        string,
        {
            bookingCount: number;
            totalEventCount: number;
            totalEventDuration: number;
            allBookingsCompleted?: boolean;
        }
    >;
}

/**
 * Fetch all register tables data for a school from headers
 */
export async function getRegisterTables(): Promise<ApiActionResponseModel<RegisterTables>> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found. Invalid subdomain or missing headers." };
        }
        const schoolId = schoolHeader.id;

        const supabase = getServerConnection();

        // Get student booking stats from RPC (includes all student data)
        const bookingStatsResults = await getStudentBookingStatus(schoolId);

        // Fetch packages
        const { data: packages, error: packagesError } = await supabase
            .from("school_package")
            .select("*")
            .eq("school_id", schoolId);

        if (packagesError) {
            return handleSupabaseError(packagesError, "fetch packages", "Failed to fetch packages");
        }

        // Fetch referrals
        const { data: referrals, error: referralsError } = await supabase
            .from("referral")
            .select("*")
            .eq("school_id", schoolId);

        if (referralsError) {
            return handleSupabaseError(referralsError, "fetch referrals", "Failed to fetch referrals");
        }

        // Transform RPC results to RegisterTables format
        const transformedStudents = bookingStatsResults.map((stat: any) => ({
            id: stat.student_id,
            studentId: stat.student_id,
            description: stat.description,
            active: stat.active,
            rental: stat.rental,
            createdAt: stat.created_at,
            student: {
                id: stat.student_id,
                firstName: stat.first_name,
                lastName: stat.last_name,
                passport: stat.passport,
                country: stat.country,
                phone: stat.phone,
                languages: stat.languages,
            },
        }));

        const transformedPackages = safeArray(packages).map((p: any) => ({
            id: p.id,
            durationMinutes: p.duration_minutes,
            description: p.description,
            pricePerStudent: p.price_per_student,
            capacityStudents: p.capacity_students,
            capacityEquipment: p.capacity_equipment,
            categoryEquipment: p.category_equipment,
            packageType: p.package_type,
            isPublic: p.is_public,
            active: p.active,
        }));

        const transformedReferrals = safeArray(referrals).map((r: any) => ({
            id: r.id,
            code: r.code,
            commissionType: r.commission_type,
            commissionValue: r.commission_value,
            description: r.description,
            active: r.active,
        }));

        // Transform RPC results to studentBookingStats
        const studentBookingStats: Record<
            string,
            {
                bookingCount: number;
                totalEventCount: number;
                totalEventDuration: number;
                allBookingsCompleted?: boolean;
            }
        > = {};

        bookingStatsResults.forEach((stat: any) => {
            studentBookingStats[stat.student_id] = {
                bookingCount: stat.booking_count,
                totalEventCount: stat.total_event_count,
                totalEventDuration: stat.total_event_duration,
                allBookingsCompleted: stat.all_bookings_completed,
            };
        });

        logger.info("Fetched register tables", { studentCount: transformedStudents.length, packageCount: transformedPackages.length, referralCount: transformedReferrals.length });

        return {
            success: true,
            data: {
                students: transformedStudents,
                packages: transformedPackages,
                referrals: transformedReferrals,
                studentBookingStats,
            },
        };
    } catch (error) {
        logger.error("Error fetching register tables", error);
        return { success: false, error: "Failed to fetch register tables" };
    }
}
