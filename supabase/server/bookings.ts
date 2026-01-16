import { getServerConnection } from "@/supabase/connection";
import { headers } from "next/headers";
import type { BookingWithLessonAndPayments, LessonWithPayments, BookingStudentPayments, BookingTableStats } from "@/config/tables";
import { calculateBookingStats } from "@/backend/data/BookingData";
import { safeArray } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

export type BookingTableData = BookingWithLessonAndPayments & { stats: BookingTableStats; currency: string };

export async function getBookingsTable(): Promise<BookingTableData[]> {
    try {
        const headersList = await headers();
        const schoolId = headersList.get("x-school-id");

        if (!schoolId) {
            return [];
        }

        const supabase = getServerConnection();

        const { data, error } = await supabase
            .from("booking")
            .select(
                `
                id,
                date_start,
                date_end,
                leader_student_name,
                status,
                school!inner(currency),
                school_package!inner(
                    description,
                    capacity_students,
                    capacity_equipment,
                    category_equipment,
                    duration_minutes,
                    price_per_student
                ),
                lesson(
                    id,
                    status,
                    teacher!inner(
                        id,
                        username
                    ),
                    teacher_commission!inner(
                        cph,
                        commission_type
                    ),
                    event(
                        duration,
                        status
                    ),
                        teacher_lesson_payment(
                            amount
                        )
                ),
                    student_booking_payment(
                        student_id,
                        amount
                    )
            `,
            )
            .eq("school_id", schoolId)
            .order("date_start", { ascending: false });

        if (error) {
            logger.error("Error fetching bookings table", error);
            return [];
        }

        const result = safeArray(data).map((booking: any) => {
            const pkg = booking.school_package;
            const currency = booking.school?.currency || "EUR";
            const studentCount = pkg.capacity_students || 1;
            const pricePerHourPerStudent = pkg.duration_minutes > 0 ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0;

            const lessons: LessonWithPayments[] = safeArray(booking.lesson).map((l: any) => {
                const totalDuration = safeArray(l.event).reduce((sum: number, e: any) => sum + (e.duration || 0), 0); // minutes
                const totalCount = safeArray(l.event).length;

                const recordedPayments = safeArray(l.teacher_lesson_payment).length > 0
                    ? safeArray(l.teacher_lesson_payment).reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
                    : 0;

                return {
                    id: l.id,
                    teacherId: l.teacher.id,
                    teacherUsername: l.teacher.username,
                    status: l.status,
                    commission: {
                        type: l.teacher_commission.commission_type as "fixed" | "percentage",
                        cph: l.teacher_commission.cph,
                    },
                    events: {
                        totalCount,
                        totalDuration: totalDuration,
                        details: safeArray(l.event).map((e: any) => ({ status: e.status, duration: e.duration || 0 })),
                    },
                    teacherPayments: recordedPayments,
                };
            });

            const payments: BookingStudentPayments[] = safeArray(booking.student_booking_payment)
                .map((p: any) => ({ student_id: p.student_id ?? 0, amount: p.amount }));

            const pkgOut = {
                description: pkg.description,
                categoryEquipment: pkg.category_equipment,
                capacityEquipment: pkg.capacity_equipment,
                capacityStudents: pkg.capacity_students,
                durationMinutes: pkg.duration_minutes,
                pricePerStudent: pkg.price_per_student,
                pph: pricePerHourPerStudent,
            };

            const bookingResult: BookingWithLessonAndPayments = {
                booking: {
                    id: booking.id,
                    dateStart: booking.date_start,
                    dateEnd: booking.date_end,
                    leaderStudentName: booking.leader_student_name,
                    status: booking.status,
                },
                package: pkgOut,
                lessons,
                payments,
            };

            const stats = calculateBookingStats(bookingResult);

            return {
                ...bookingResult,
                stats,
                currency,
            };
        });

        logger.debug("Fetched bookings table", { schoolId, count: result.length });
        return result;
    } catch (error) {
        logger.error("Error fetching bookings table", error);
        return [];
    }
}
