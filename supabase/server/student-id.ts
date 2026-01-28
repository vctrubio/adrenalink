import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { StudentData, StudentUpdateForm, StudentRelations, calculateStudentStats } from "@/backend/data/StudentData";
import { calculateBookingStats } from "@/backend/data/BookingData";
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
                    student_booking_payment(*),
                    booking_student(
                        student(*)
                    )
                )
            `,
            )
            .eq("student_id", id)
            .eq("booking.school_id", schoolId);

        if (bookingError) {
            logger.warn("Error fetching student bookings", bookingError);
        }

        // 3. Transform bookings into the structure needed for unified getters and table cards
        const bookings = safeArray(bookingLinks)
            .map((bl: any) => {
                const b = bl.booking;
                if (!b) return null;

                const pkg = b.school_package;

                const lessons = safeArray(b.lesson).map((l: any) => {
                    const events = safeArray(l.event);
                    const totalDuration = events.reduce((sum: number, e: any) => sum + (e.duration || 0), 0);
                    const recordedPayments = safeArray(l.teacher_lesson_payment).reduce(
                        (sum: number, p: any) => sum + (p.amount || 0),
                        0
                    );

                    return {
                        id: l.id,
                        teacherId: l.teacher?.id,
                        teacherUsername: l.teacher?.username || "Unknown",
                        status: l.status,
                        commission: {
                            type: l.teacher_commission?.commission_type as "fixed" | "percentage",
                            cph: l.teacher_commission?.cph || "0",
                        },
                        events: {
                            totalCount: events.length,
                            totalDuration: totalDuration,
                            details: events.map((e: any) => ({ status: e.status, duration: e.duration || 0 })),
                        },
                        teacherPayments: recordedPayments,
                    };
                });

                const payments = safeArray(b.student_booking_payment).map((p: any) => ({
                    id: p.id,
                    student_id: p.student_id,
                    amount: p.amount,
                    created_at: p.created_at,
                }));

                const packageDetails = {
                    description: pkg.description,
                    categoryEquipment: pkg.category_equipment,
                    capacityEquipment: pkg.capacity_equipment,
                    capacityStudents: pkg.capacity_students,
                    durationMinutes: pkg.duration_minutes,
                    pricePerStudent: pkg.price_per_student,
                    pph: pkg.duration_minutes > 0 ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0,
                };

                // For statistical calculation in Student ID view, we calculate revenue 
                // based on a single student's participation (capacityStudents: 1)
                const bookingStats = calculateBookingStats({
                    package: { ...packageDetails, capacityStudents: 1 },
                    lessons,
                    payments,
                } as any);

                return {
                    id: b.id,
                    status: b.status,
                    dateStart: b.date_start,
                    dateEnd: b.date_end,
                    packageName: pkg.description,
                    packageDetails,
                    lessons,
                    payments,
                    stats: bookingStats,
                    // raw data for lessonsToTransactionEvents
                    _raw_lessons: safeArray(b.lesson).map((l: any) => ({
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
                            booking_student: safeArray(b.booking_student).map((bs:any) => ({ student: bs.student }))
                        }
                    }))
                };
            })
            .filter((b: any) => b !== null);

        const schoolStudent = student.school_students[0];

        // 4. Fetch associated student packages (requests)
        const { data: studentPackages } = await supabase
            .from("student_package")
            .select(
                `
                *,
                school_package!inner(*)
            `,
            )
            .eq("student_id", id);

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

        const studentTableData: any = {
            id: student.id,
            firstName: student.first_name,
            lastName: student.last_name,
            passport: student.passport,
            country: student.country,
            phone: student.phone,
            languages: student.languages,
            schoolStudentStatus: schoolStudent?.active ? "active" : "inactive",
            schoolStudentDescription: schoolStudent?.description || null,
            createdAt: student.created_at,
            bookings: bookings,
        };

        const stats = calculateStudentStats(studentTableData);

        // Unified processing of all lessons into transactions and lessonRows
        const allRawLessons = bookings.flatMap((b: any) => b._raw_lessons || []);
        const transactions = lessonsToTransactionEvents(allRawLessons, schoolHeader.currency || "YEN");

        const lessonPaymentsMap: Record<string, number> = {};
        allRawLessons.forEach((l: any) => {
            lessonPaymentsMap[l.id] = safeArray(l.teacher_lesson_payment).reduce(
                (sum: number, p: any) => sum + (p.amount || 0),
                0
            );
        });
        const lessonRows = groupTransactionsByLesson(transactions, lessonPaymentsMap);

        const studentData: StudentData = {
            ...studentTableData,
            stats,
            schema,
            updateForm: {
                ...schema,
                description: schoolStudent?.description || null,
                active: schoolStudent?.active ?? true,
                rental: schoolStudent?.rental ?? false,
                schoolId: schoolId,
            },
            relations: {
                school_students: student.school_students,
                bookings: bookings,
                student_booking_payment: bookings.flatMap(b => b.payments || []),
                student_package: safeArray(studentPackages).map((sp: any) => ({
                    ...sp,
                    school_package: sp.school_package,
                })),
            },
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