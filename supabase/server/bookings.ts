import { getServerConnection } from "@/supabase/connection";
import { headers } from "next/headers";

export interface BookingTableData {
    id: string;
    dateStart: string;
    dateEnd: string;
    leaderStudentName: string;
    packageName: string;
    status: string;
    capacityStudents: number;
    packageDetails: {
        categoryEquipment: string;
        capacityEquipment: number;
        durationMinutes: number;
        pricePerStudent: number;
    };
    lessons: {
        id: string;
        teacherId: string;
        teacherUsername: string;
        eventCount: number;
        totalDurationHours: number;
        status: string;
        commission: {
            type: "fixed" | "percentage";
            cph: string;
        };
    }[];
    totalStudentPayments: number;
    totalEventRevenue: number;
    totalTeacherPayments: number;
    totalTeacherCommissions: number;
}

export async function getBookingsTable(): Promise<BookingTableData[]> {
    try {
        const headersList = await headers();
        const schoolId = headersList.get("x-school-id");

        if (!schoolId) {
            console.error("❌ No school ID found in headers");
            return [];
        }

        const supabase = getServerConnection();

        const { data, error } = await supabase
            .from("booking")
            .select(`
                id,
                date_start,
                date_end,
                leader_student_name,
                status,
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
                        duration
                    ),
                    teacher_lesson_payment(
                        amount
                    )
                ),
                student_booking_payment(
                    amount
                )
            `)
            .eq("school_id", schoolId)
            .order("date_start", { ascending: false });

        if (error) {
            console.error("Error fetching bookings table:", error);
            return [];
        }

        return data.map((booking: any) => {
            const studentCount = booking.school_package.capacity_students || 1;
            const pkg = booking.school_package;
            const pricePerHourPerStudent = (pkg.duration_minutes > 0) ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0;

            let totalTeacherCommissions = 0;
            let totalTeacherPayments = 0;
            let totalEventRevenue = 0;

            const lessons = booking.lesson.map((l: any) => {
                const totalDurationHours = l.event.reduce((sum: number, e: any) => sum + e.duration, 0) / 60;
                const cph = parseFloat(l.teacher_commission.cph || "0");
                const type = l.teacher_commission.commission_type;
                
                // Revenue for this lesson's portion
                const lessonRevenue = pricePerHourPerStudent * totalDurationHours * studentCount;
                totalEventRevenue += lessonRevenue;

                let commissions = 0;
                if (type === "fixed") {
                    commissions = cph * totalDurationHours;
                } else if (type === "percentage") {
                    commissions = lessonRevenue * (cph / 100);
                }
                
                totalTeacherCommissions += commissions;

                // Actual recorded payments
                const recordedPayments = l.teacher_lesson_payment.reduce((sum: number, p: any) => sum + p.amount, 0);
                totalTeacherPayments += recordedPayments;

                return {
                    id: l.id,
                    teacherId: l.teacher.id,
                    teacherUsername: l.teacher.username,
                    eventCount: l.event.length,
                    totalDurationHours,
                    status: l.status,
                    commission: {
                        type: l.teacher_commission.commission_type as "fixed" | "percentage",
                        cph: l.teacher_commission.cph,
                    },
                };
            });

            const totalStudentPayments = booking.student_booking_payment.reduce((sum: number, p: any) => sum + p.amount, 0);

            return {
                id: booking.id,
                dateStart: booking.date_start,
                dateEnd: booking.date_end,
                leaderStudentName: booking.leader_student_name,
                packageName: booking.school_package.description,
                status: booking.status,
                capacityStudents: booking.school_package.capacity_students,
                packageDetails: {
                    categoryEquipment: booking.school_package.category_equipment,
                    capacityEquipment: booking.school_package.capacity_equipment,
                    durationMinutes: booking.school_package.duration_minutes,
                    pricePerStudent: booking.school_package.price_per_student,
                },
                lessons,
                totalStudentPayments,
                totalEventRevenue,
                totalTeacherPayments,
                totalTeacherCommissions,
            };
        });
    } catch (error) {
        console.error("Unexpected error in getBookingsTable:", error);
        return [];
    }
}
