import { getServerConnection } from "@/supabase/connection";
import { headers } from "next/headers";
import type { StudentWithBookingsAndPayments, StudentTableData, LessonWithPayments, BookingStudentPayments } from "@/config/tables";
import { calculateStudentStats } from "@/backend/data/StudentData";
import { calculateBookingStats } from "@/backend/data/BookingData";
import { safeArray } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

export async function getStudentsTable(): Promise<StudentTableData[]> {
    try {
        const headersList = await headers();
        const schoolId = headersList.get("x-school-id");

        if (!schoolId) {
            return [];
        }

        const supabase = getServerConnection();

        // Fetch students associated with the school and their bookings
        const { data, error } = await supabase
            .from("school_students")
            .select(
                `
                active,
                description,
                student!inner(
                    id,
                    first_name,
                    last_name,
                    country,
                    phone,
                    languages,
                    created_at,
                    booking_student(
                        booking!inner(
                            id,
                            status,
                            date_start,
                            date_end,
                            school_package!inner(
                                description,
                                category_equipment,
                                capacity_equipment,
                                capacity_students,
                                duration_minutes,
                                price_per_student
                            ),
                            lesson(
                                id,
                                status,
                                teacher!inner(id, username),
                                teacher_commission!inner(cph, commission_type),
                                event(duration, status),
                                teacher_lesson_payment(amount)
                            ),
                            student_booking_payment(amount)
                        )
                    )
                )
            `,
            )
            .eq("school_id", schoolId);

        if (error) {
            logger.error("Error fetching students table", error);
            return [];
        }

        const result = safeArray(data).map((ss: any) => {
            const student = ss.student;

            const bookings = student.booking_student.map((bs: any) => {
                const b = bs.booking;
                const pkg = b.school_package;

                const lessons: LessonWithPayments[] = b.lesson.map((l: any) => {
                    const totalDuration = l.event.reduce((sum: number, e: any) => sum + (e.duration || 0), 0);
                    const recordedPayments = l.teacher_lesson_payment
                        ? l.teacher_lesson_payment.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
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
                            totalCount: l.event.length,
                            totalDuration: totalDuration,
                            details: l.event.map((e: any) => ({ status: e.status, duration: e.duration || 0 })),
                        },
                        teacherPayments: recordedPayments,
                    };
                });

                const payments: BookingStudentPayments[] = b.student_booking_payment.map((p: any) => ({
                    student_id: 0,
                    amount: p.amount,
                }));

                const bookingData = {
                    package: {
                        description: pkg.description,
                        categoryEquipment: pkg.category_equipment,
                        capacityEquipment: pkg.capacity_equipment,
                        capacityStudents: pkg.capacity_students,
                        durationMinutes: pkg.duration_minutes,
                        pricePerStudent: pkg.price_per_student,
                        pph: pkg.duration_minutes > 0 ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0,
                    },
                    lessons,
                    payments,
                };

                const bookingStats = calculateBookingStats(bookingData as any);

                return {
                    id: b.id,
                    status: b.status,
                    dateStart: b.date_start,
                    dateEnd: b.date_end,
                    packageName: pkg.description,
                    packageDetails: bookingData.package,
                    lessons,
                    stats: bookingStats,
                };
            });

            const studentResult: StudentWithBookingsAndPayments = {
                id: student.id,
                firstName: student.first_name,
                lastName: student.last_name,
                country: student.country,
                phone: student.phone,
                languages: student.languages,
                schoolStudentStatus: ss.active ? "active" : "inactive",
                schoolStudentDescription: ss.description,
                createdAt: student.created_at,
                bookings,
            };

            const stats = calculateStudentStats(studentResult);

            return {
                ...studentResult,
                stats,
            };
        });

        logger.debug("Fetched students table", { schoolId, count: result.length });
        return result;
    } catch (error) {
        logger.error("Error fetching students table", error);
        return [];
    }
}

