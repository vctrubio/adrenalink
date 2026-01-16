import { getServerConnection } from "@/supabase/connection";
import { getSchoolContext } from "@/backend/school-context";
import { StudentData, StudentUpdateForm, StudentRelations } from "@/backend/data/StudentData";
import { Student } from "@/supabase/db/types";
import { convertUTCToSchoolTimezone } from "@/getters/timezone-getter";
import { handleSupabaseError, safeArray } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

/**
 * Fetches a student by ID with all relations mapped to StudentData interface.
 * Consolidates payments from all participations (bookings).
 */
export async function getStudentId(id: string): Promise<{ success: boolean; data?: StudentData; error?: string }> {
    try {
        const context = await getSchoolContext();
        if (!context) {
            return { success: false, error: "School context not found" };
        }
        const { schoolId, timezone } = context;

        const supabase = getServerConnection();

        // 1. Fetch core student info and school student context
        const { data: student, error: studentError } = await supabase
            .from("student")
            .select(
                `
                *,
                school_students!inner(*)
            `,
            )
            .eq("id", id)
            .eq("school_students.school_id", schoolId)
            .single();

        if (studentError || !student) {
            return handleSupabaseError(studentError, "fetch student details", "Student not found");
        }

        // 2. Fetch all bookings this student is part of, including all payments for those bookings
        const { data: bookingLinks, error: bookingError } = await supabase
            .from("booking_student")
            .select(
                `
                booking!inner(
                    *,
                    school_package!inner(*),
                    lesson(
                        *,
                        teacher(id, username, first_name, last_name),
                        teacher_commission(cph, commission_type),
                        event(*)
                    ),
                    student_booking_payment(*)
                )
            `,
            )
            .eq("student_id", id)
            .eq("booking.school_id", schoolId);

        if (bookingError) {
            logger.warn("Error fetching student bookings", bookingError);
        }

        // 3. Transform bookings and aggregate ALL payments
        const bookings = safeArray(bookingLinks)
            .map((bl: any) => {
                const b = bl.booking;
                if (!b) return null;

                return {
                    id: b.id,
                    status: b.status,
                    leader_student_name: b.leader_student_name,
                    date_start: b.date_start,
                    date_end: b.date_end,
                    created_at: b.created_at,
                    school_package: {
                        id: b.school_package.id,
                        description: b.school_package.description,
                        duration_minutes: b.school_package.duration_minutes,
                        price_per_student: b.school_package.price_per_student,
                        capacity_students: b.school_package.capacity_students,
                        capacity_equipment: b.school_package.capacity_equipment,
                        category_equipment: b.school_package.category_equipment,
                    },
                    lessons: safeArray(b.lesson).map((l: any) => {
                        const events = safeArray(l.event).map((evt: any) => {
                            if (timezone) {
                                const convertedDate = convertUTCToSchoolTimezone(new Date(evt.date), timezone!);
                                return { ...evt, date: convertedDate.toISOString() };
                            }
                            return evt;
                        });

                        // Normalize to match buildTeacherLessonData expected structure
                        // Transform: events -> event (singular), add booking with school_package nested
                        return {
                            ...l,
                            id: l.id,
                            status: l.status,
                            teacher: {
                                id: l.teacher?.id,
                                username: l.teacher?.username,
                                first_name: l.teacher?.first_name,
                            },
                            // Normalize: events -> event (singular) to match teacher data structure
                            event: events,
                            // Add booking object with school_package nested (as expected by buildTeacherLessonData)
                            booking: {
                                id: b.id,
                                leader_student_name: b.leader_student_name,
                                date_start: b.date_start,
                                date_end: b.date_end,
                                status: b.status,
                                school_package: b.school_package,
                            },
                            // teacher_commission is already in the correct structure
                            teacher_commission: {
                                commission_type: l.teacher_commission?.commission_type,
                                cph: l.teacher_commission?.cph,
                            },
                        };
                    }),
                    student_booking_payment: safeArray(b.student_booking_payment).map((p: any) => ({
                        id: p.id,
                        amount: p.amount,
                        created_at: p.created_at,
                    })),
                };
            })
            .filter((b: any) => b !== null);

        // Aggregate ALL payments from all participating bookings
        const allBookingPayments = bookings.flatMap((b) => b.student_booking_payment);

        // 4. Fetch associated student packages (requests)
        const { data: studentPackages } = await supabase
            .from("student_package")
            .select(
                `
                *,
                school_package!inner(*)
            `,
            )
            .in(
                "school_package_id",
                bookings.map((b) => b.school_package?.id).filter((id) => !!id),
            );

        const schoolStudent = student.school_students[0];

        const relations: StudentRelations = {
            school_students: student.school_students,
            student_package: safeArray(studentPackages).map((sp: any) => ({
                ...sp,
                school_package: sp.school_package,
            })),
            bookings: bookings,
            student_booking_payment: allBookingPayments,
        };

        const schema: Student = {
            id: student.id,
            first_name: student.first_name,
            last_name: student.last_name,
            passport: student.passport,
            country: student.country,
            phone: student.phone,
            languages: student.languages,
            created_at: student.created_at,
            updated_at: student.updated_at,
        };

        const updateForm: StudentUpdateForm = {
            ...schema,
            description: schoolStudent?.description || null,
            active: schoolStudent?.active ?? true,
            rental: schoolStudent?.rental ?? false,
            schoolId: schoolId,
        };

        const studentData: StudentData = {
            schema,
            updateForm,
            relations,
        };

        logger.debug("Fetched student details", { studentId: id, schoolId, bookingCount: bookings.length });
        return { success: true, data: studentData };
    } catch (error) {
        logger.error("Error fetching student details", error);
        return { success: false, error: "Failed to fetch student" };
    }
}
