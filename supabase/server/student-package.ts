"use server";
import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { StudentPackage, SchoolPackage, Referral } from "@/supabase/db/types";
import { logger } from "@/backend/logger";
import { safeArray, handleSupabaseError } from "@/backend/error-handlers";
import { masterBookingAdd } from "@/supabase/server/register";
import { revalidatePath } from "next/cache";

export interface StudentPackageRequest extends StudentPackage {
    school_package: SchoolPackage;
    referral?: Referral;
    student_name?: {
        firstName: string;
        lastName: string;
        fullName: string;
    } | null;
    student_data?: {
        // Full student data from school_students join with student table
        id: string;
        school_id: string;
        student_id: string;
        clerk_id: string;
        description: string | null;
        active: boolean;
        rental: boolean;
        created_at: string;
        updated_at: string;
        student: {
            id: string;
            first_name: string;
            last_name: string;
            passport: string | null;
            country: string | null;
            phone: string | null;
            languages: string[] | null;
            created_at: string;
            updated_at: string;
        };
    } | null;
}

/**
 * Fetches student package requests for the current school.
 * Default sorting: newest requests first (by created_at descending).
 * Includes student names from school_students table.
 */
export async function getStudentPackageRequests(): Promise<{ success: boolean; data?: StudentPackageRequest[]; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        const supabase = getServerConnection();

        // First, get all student package requests
        const { data: requests, error: requestsError } = await supabase
            .from("student_package")
            .select(
                `
                *,
                school_package!inner(*),
                referral(*)
            `,
            )
            .eq("school_package.school_id", schoolHeader.id)
            .order("created_at", { ascending: false }); // Default: newest first

        if (requestsError) {
            logger.error("Error fetching student package requests", requestsError);
            return { success: false, error: "Failed to fetch requests" };
        }

        if (!requests || requests.length === 0) {
            return { success: true, data: [] };
        }

        // Get all unique clerk_ids from requests
        const clerkIds = [...new Set(requests.map((r) => r.requested_clerk_id).filter(Boolean))];

        // Fetch FULL student data for all clerk_ids in one query (not just names)
        const { data: schoolStudents, error: studentsError } = await supabase
            .from("school_students")
            .select(
                `
                *,
                student!inner(*)
            `,
            )
            .eq("school_id", schoolHeader.id)
            .in("clerk_id", clerkIds);

        if (studentsError) {
            logger.error("Error fetching student data", studentsError);
            // Continue without data rather than failing
        }

        // Create maps of clerk_id -> student data and student name
        const studentDataMap: Record<string, any> = {};
        const studentNameMap: Record<string, { firstName: string; lastName: string; fullName: string }> = {};
        
        if (schoolStudents) {
            schoolStudents.forEach((ss: any) => {
                if (ss.clerk_id && ss.student) {
                    const firstName = ss.student.first_name || "";
                    const lastName = ss.student.last_name || "";
                    
                    // Store full student data
                    studentDataMap[ss.clerk_id] = ss;
                    
                    // Store name for backward compatibility
                    studentNameMap[ss.clerk_id] = {
                        firstName,
                        lastName,
                        fullName: `${firstName} ${lastName}`.trim(),
                    };
                }
            });
        }

        // Attach student names and full data to each request
        const requestsWithNames = requests.map((request) => ({
            ...request,
            student_name: studentNameMap[request.requested_clerk_id] || null,
            student_data: studentDataMap[request.requested_clerk_id] || null,
        }));

        return { success: true, data: requestsWithNames as StudentPackageRequest[] };
    } catch (error) {
        logger.error("Unexpected error in getStudentPackageRequests", error);
        return { success: false, error: "Failed to fetch requests" };
    }
}

/**
 * Updates the status of a student package request.
 */
export async function updateStudentPackageStatus(id: string, status: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = getServerConnection();

        // First, get the student_package to find the requested_clerk_id
        const { data: studentPackage, error: fetchError } = await supabase
            .from("student_package")
            .select("requested_clerk_id")
            .eq("id", id)
            .single();

        if (fetchError || !studentPackage) {
            logger.error("Error fetching student package", fetchError);
            return { success: false, error: "Failed to fetch student package" };
        }

        // Update the status
        const { error } = await supabase
            .from("student_package")
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) {
            logger.error("Error updating student package status", error);
            return { success: false, error: "Failed to update status" };
        }

        // Get student_id from clerk_id to revalidate student page
        if (studentPackage.requested_clerk_id) {
            const { data: schoolStudent } = await supabase
                .from("school_students")
                .select("student_id")
                .eq("clerk_id", studentPackage.requested_clerk_id)
                .single();

            if (schoolStudent?.student_id) {
                // Revalidate student pages so they see updated status
                revalidatePath(`/student/${schoolStudent.student_id}`);
                revalidatePath(`/student/${schoolStudent.student_id}/bookings`);
            }
        }

        // No revalidation needed for admin page - listener will pick up the change automatically
        return { success: true };
    } catch (error) {
        logger.error("Unexpected error in updateStudentPackageStatus", error);
        return { success: false, error: "Failed to update status" };
    }
}

/**
 * Interface for student package with usage stats
 */
export interface StudentPackageWithStats extends StudentPackageRequest {
    usage_stats: {
        booking_count: number;
        event_count: number;
        total_duration_minutes: number;
        total_revenue: number;
    };
}

/**
 * Fetches all student packages for a school with calculated usage stats.
 */
export async function getStudentPackagesWithStats(): Promise<{ success: boolean; data?: StudentPackageWithStats[]; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        const supabase = getServerConnection();

        // Fetch student packages with their bookings, lessons, and events
        const { data, error } = await supabase
            .from("student_package")
            .select(
                `
                *,
                school_package!inner(*),
                referral(*),
                booking(
                    id,
                    lesson(
                        duration,
                        event(duration)
                    )
                )
            `,
            )
            .eq("school_package.school_id", schoolHeader.id)
            .order("created_at", { ascending: false });

        if (error) {
            logger.error("Error fetching student packages with stats", error);
            return { success: false, error: "Failed to fetch packages" };
        }

        const packagesWithStats = safeArray(data).map((sp: any) => {
            const bookings = safeArray(sp.booking);
            const booking_count = bookings.length;

            let event_count = 0;
            let total_duration_minutes = 0;

            bookings.forEach((b: any) => {
                const lessons = safeArray(b.lesson);
                lessons.forEach((l: any) => {
                    const events = safeArray(l.event);
                    event_count += events.length;
                    total_duration_minutes += events.reduce((sum: number, e: any) => sum + (e.duration || 0), 0);
                });
            });

            const pkg = sp.school_package;
            const price_per_minute = pkg.duration_minutes > 0 ? pkg.price_per_student / pkg.duration_minutes : 0;
            const total_revenue = price_per_minute * total_duration_minutes * (pkg.capacity_students || 1);

            return {
                ...sp,
                usage_stats: {
                    booking_count,
                    event_count,
                    total_duration_minutes,
                    total_revenue,
                },
            } as StudentPackageWithStats;
        });

        return { success: true, data: packagesWithStats };
    } catch (error) {
        logger.error("Unexpected error in getStudentPackagesWithStats", error);
        return { success: false, error: "Failed to fetch packages" };
    }
}

/**
 * Creates a new student package request.
 */
export async function createStudentPackageRequest(params: {
    schoolPackageId: string;
    startDate: string;
    endDate: string;
    clerkId: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const supabase = getServerConnection();

        // Check if student already has a pending or active request for this specific school package
        // (Wait, user didn't ask for this check, but it's good practice. I'll skip for now to keep it simple as requested)

        const { data, error } = await supabase
            .from("student_package")
            .insert({
                school_package_id: params.schoolPackageId,
                requested_date_start: params.startDate,
                requested_date_end: params.endDate,
                requested_clerk_id: params.clerkId,
                status: "requested",
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            logger.error("Error creating student package request", error);
            return { success: false, error: "Failed to submit request" };
        }

        // No revalidation needed - listener will pick up the change automatically
        return { success: true, data };
    } catch (error) {
        logger.error("Unexpected error in createStudentPackageRequest", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Gets student by clerk_id from school_students table
 */
export async function getStudentByClerkId(clerkId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        const supabase = getServerConnection();

        const { data, error } = await supabase
            .from("school_students")
            .select(
                `
                *,
                student(*)
            `,
            )
            .eq("school_id", schoolHeader.id)
            .eq("clerk_id", clerkId)
            .single();

        if (error) {
            return handleSupabaseError(error, "fetch student by clerk_id", "Student not found for this clerk ID");
        }

        return { success: true, data };
    } catch (error) {
        logger.error("Unexpected error in getStudentByClerkId", error);
        return { success: false, error: "Failed to fetch student" };
    }
}

/**
 * Gets student package requests for the same school_package_id (for matching students)
 */
export async function getStudentPackageRequestsByPackageId(
    schoolPackageId: string,
): Promise<{ success: boolean; data?: StudentPackageRequest[]; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        const supabase = getServerConnection();

        const { data, error } = await supabase
            .from("student_package")
            .select(
                `
                *,
                school_package!inner(*),
                referral(*)
            `,
            )
            .eq("school_package_id", schoolPackageId)
            .eq("school_package.school_id", schoolHeader.id)
            .in("status", ["requested"])
            .order("created_at", { ascending: false });

        if (error) {
            logger.error("Error fetching student package requests by package ID", error);
            return { success: false, error: "Failed to fetch requests" };
        }

        return { success: true, data: data as StudentPackageRequest[] };
    } catch (error) {
        logger.error("Unexpected error in getStudentPackageRequestsByPackageId", error);
        return { success: false, error: "Failed to fetch requests" };
    }
}

/**
 * Gets all students for the school, formatted for StudentTable
 */
export async function getAllStudentsForSchool(): Promise<{
    success: boolean;
    data?: {
        students: any[];
        studentStatsMap: Record<string, any>;
    };
    error?: string;
}> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        const supabase = getServerConnection();

        // Get all students for the school
        const { data: schoolStudents, error: studentsError } = await supabase
            .from("school_students")
            .select(
                `
                *,
                student(*)
            `,
            )
            .eq("school_id", schoolHeader.id)
            .eq("active", true); // Only active students

        if (studentsError) {
            logger.error("Error fetching all students", studentsError);
            return { success: false, error: "Failed to fetch students" };
        }

        // Get student booking stats
        const { getStudentBookingStatus } = await import("@/supabase/rpc/student_booking_status");
        const bookingStats = await getStudentBookingStatus(schoolHeader.id);

        // Transform to StudentTable format
        const formattedStudents = safeArray(schoolStudents).map((ss: any) => ({
            id: ss.student_id,
            studentId: ss.student_id,
            description: ss.description,
            active: ss.active,
            rental: ss.rental,
            createdAt: new Date(ss.created_at),
            updatedAt: new Date(ss.created_at),
            student: {
                id: ss.student.id,
                firstName: ss.student.first_name,
                lastName: ss.student.last_name,
                passport: ss.student.passport,
                country: ss.student.country,
                languages: ss.student.languages,
            },
        }));

        const statsMap: Record<string, any> = {};
        bookingStats.forEach((stat: any) => {
            statsMap[stat.student_id] = {
                bookingCount: stat.booking_count,
                totalEventCount: stat.total_event_count,
                totalEventDuration: stat.total_event_duration,
                allBookingsCompleted: stat.all_bookings_completed,
            };
        });

        return {
            success: true,
            data: {
                students: formattedStudents,
                studentStatsMap: statsMap,
            },
        };
    } catch (error) {
        logger.error("Unexpected error in getAllStudentsForSchool", error);
        return { success: false, error: "Failed to fetch students" };
    }
}


/**
 * Accepts a student package request and creates a booking.
 * Supports any capacity - accepts array of studentIds.
 */
export async function acceptStudentPackageAndCreateBooking(params: {
    studentPackageId: string;
    studentIds: string[];
    teacherId?: string;
    commissionId?: string;
    leaderStudentName: string;
}): Promise<{ success: boolean; data?: { booking: any; lesson?: any }; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        const supabase = getServerConnection();

        // 1. Get the student package with school package details
        const { data: studentPackage, error: spError } = await supabase
            .from("student_package")
            .select(
                `
                *,
                school_package!inner(*)
            `,
            )
            .eq("id", params.studentPackageId)
            .single();

        if (spError || !studentPackage) {
            return handleSupabaseError(spError, "fetch student package", "Student package not found");
        }

        // 2. Validate student count matches capacity
        if (params.studentIds.length !== studentPackage.school_package.capacity_students) {
            return {
                success: false,
                error: `Student count (${params.studentIds.length}) must match package capacity (${studentPackage.school_package.capacity_students})`,
            };
        }

        // 3. Create booking using masterBookingAdd
        const bookingResult = await masterBookingAdd(
            studentPackage.school_package_id,
            params.studentIds,
            studentPackage.requested_date_start,
            studentPackage.requested_date_end,
            params.teacherId,
            params.commissionId,
            studentPackage.referral_id || undefined,
            params.leaderStudentName,
        );

        if (!bookingResult.success) {
            return bookingResult;
        }

        // 5. Link student_package_id to booking_student for all selected students
        if (bookingResult.data?.booking?.id) {
            for (const studentId of params.studentIds) {
                const { error: linkError } = await supabase
                    .from("booking_student")
                    .update({ student_package_id: params.studentPackageId })
                    .eq("booking_id", bookingResult.data.booking.id)
                    .eq("student_id", studentId);

                if (linkError) {
                    logger.error("Error linking student_package to booking_student", linkError);
                    // Don't fail the whole operation, just log it
                }
            }
        }

        // 6. Update student_package status to "accepted"
        const { error: updateError } = await supabase
            .from("student_package")
            .update({
                status: "accepted",
                updated_at: new Date().toISOString(),
            })
            .eq("id", params.studentPackageId);

        if (updateError) {
            logger.error("Error updating student package status", updateError);
            // Don't fail the whole operation, just log it
        }

        // 7. Revalidate student pages for all students involved
        // Get student_ids from the requested_clerk_id to revalidate their pages
        if (studentPackage.requested_clerk_id) {
            const { data: schoolStudent } = await supabase
                .from("school_students")
                .select("student_id")
                .eq("clerk_id", studentPackage.requested_clerk_id)
                .single();

            if (schoolStudent?.student_id) {
                // Revalidate student pages so they see the new booking
                revalidatePath(`/student/${schoolStudent.student_id}`);
                revalidatePath(`/student/${schoolStudent.student_id}/bookings`);
            }
        }

        // Also revalidate for any additional students (if capacity > 1)
        for (const studentId of params.studentIds) {
            revalidatePath(`/student/${studentId}`);
            revalidatePath(`/student/${studentId}/bookings`);
        }

        logger.info("Accepted student package and created booking", {
            studentPackageId: params.studentPackageId,
            bookingId: bookingResult.data?.booking?.id,
            hasLesson: !!bookingResult.data?.lesson,
        });

        return {
            success: true,
            data: {
                booking: bookingResult.data?.booking,
                lesson: bookingResult.data?.lesson,
            },
        };
    } catch (error) {
        logger.error("Unexpected error in acceptStudentPackageAndCreateBooking", error);
        return { success: false, error: "Failed to accept package and create booking" };
    }
}
