import { getServerConnection } from "@/supabase/connection";
import { headers } from "next/headers";
import type { StudentWithBookingsAndPayments, StudentTableData, LessonWithPayments, BookingStudentPayments } from "@/config/tables";
import { calculateStudentStats } from "@/backend/data/StudentData";
import { calculateBookingStats } from "@/backend/data/BookingData";
import { getStudentEventsRPC } from "@/supabase/rpc/student_events";
import type { ApiActionResponseModel } from "@/types/actions";

export async function getStudentsTable(): Promise<StudentTableData[]> {
    try {
        const headersList = await headers();
        const schoolId = headersList.get("x-school-id");

        if (!schoolId) {
            console.error("❌ No school ID found in headers");
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
            console.error("Error fetching students table:", error);
            return [];
        }

        return data.map((ss: any) => {
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

            const result: StudentWithBookingsAndPayments = {
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

            const stats = calculateStudentStats(result);

            return {
                ...result,
                stats,
            };
        });
    } catch (error) {
        console.error("Unexpected error in getStudentsTable:", error);
        return [];
    }
}

export async function getStudentEvents(studentId: string, schoolId?: string): Promise<ApiActionResponseModel<any[]>> {
    try {
        const supabase = getServerConnection();
        const events = await getStudentEventsRPC(supabase, studentId, schoolId);

        const mappedEvents = events.map((e) => ({
            id: e.event_id,
            date: e.event_date,
            duration: e.event_duration,
            location: e.event_location,
            status: e.event_status,
            teacher: {
                id: e.teacher_id,
                firstName: e.teacher_first_name,
                lastName: e.teacher_last_name,
                username: e.teacher_username,
            },
            schoolPackage: {
                id: e.package_id,
                description: e.package_description,
                durationMinutes: e.package_duration_minutes,
                pricePerStudent: e.package_price_per_student,
                categoryEquipment: e.package_category_equipment,
                capacityEquipment: e.package_capacity_equipment,
                capacityStudents: e.package_capacity_students,
            },
        }));

        return { success: true, data: mappedEvents };
    } catch (error) {
        console.error("Error in getStudentEvents:", error);
        return { success: false, error: "Failed to fetch student events" };
    }
}
