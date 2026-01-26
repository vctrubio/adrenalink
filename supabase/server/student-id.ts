import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { StudentData, StudentUpdateForm, StudentRelations } from "@/backend/data/StudentData";
import { Student } from "@/supabase/db/types";
import { handleSupabaseError, safeArray } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";
import { lessonsToTransactionEvents, groupTransactionsByLesson } from "@/getters/booking-lesson-event-getter";

/**
 * Fetches a student by ID with all relations mapped to StudentData interface.
 * Consolidates payments from all participations (bookings).
 */
export async function getStudentId(id: string): Promise<{ success: boolean; data?: StudentData; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }
        const schoolId = schoolHeader.id;

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
                        event(
                            *,
                            equipment_event(
                                equipment(
                                    id,
                                    sku,
                                    brand,
                                    model,
                                    color,
                                    size,
                                    category,
                                    status
                                )
                            )
                        ),
                        teacher_lesson_payment(*)
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

        // 3. Transform bookings into the structure needed for unified getters
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
                    school_package: b.school_package,
                    lessons: safeArray(b.lesson).map((l: any) => ({
                        ...l,
                        event: safeArray(l.event).map((evt: any) => ({
                            ...evt,
                            equipment_event: safeArray(evt.equipment_event),
                        })),
                        teacher: l.teacher,
                        teacher_commission: l.teacher_commission,
                        booking: { 
                            id: b.id,
                            leader_student_name: b.leader_student_name,
                            date_start: b.date_start,
                            date_end: b.date_end,
                            status: b.status,
                            school_package: b.school_package,
                            booking_student: safeArray(b.booking_student).map((bs:any) => ({student: bs.student}))
                        }
                    })),
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

        // Unified processing of all lessons into transactions and lessonRows
        const allLessons = bookings.flatMap((b: any) => b.lessons || []);
        const transactions = lessonsToTransactionEvents(allLessons, schoolHeader.currency || "YEN");

        const lessonPaymentsMap: Record<string, number> = {};
        allLessons.forEach((l: any) => {
            lessonPaymentsMap[l.id] = safeArray(l.teacher_lesson_payment).reduce(
                (sum: number, p: any) => sum + (p.amount || 0),
                0
            );
        });
        const lessonRows = groupTransactionsByLesson(transactions, lessonPaymentsMap);


        const studentData: StudentData = {
            schema,
            updateForm,
            relations,
            transactions,
            lessonRows,
        };

        logger.debug("Fetched student details", { studentId: id, schoolId, bookingCount: bookings.length });
        return { success: true, data: studentData };
    } catch (error) {
        logger.error("Error fetching student details", error);
        return { success: false, error: "Failed to fetch student" };
    }
}