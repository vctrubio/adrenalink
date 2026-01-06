import { getServerConnection } from "@/supabase/connection";
import { headers } from "next/headers";

export interface StudentTableData {
    studentId: string;
    firstName: string;
    lastName: string;
    country: string;
    phone: string;
    languages: string[];
    schoolStudentStatus: string;
    schoolStudentDescription: string | null;
    bookings: {
        id: string;
        status: string;
        dateStart: string;
        dateEnd: string;
        packageName: string;
        packageDetails: {
            categoryEquipment: string;
            capacityEquipment: number;
            capacityStudents: number;
            durationMinutes: number;
            pricePerStudent: number;
        };
        eventCount: number;
        totalDurationHours: number;
        expectedRevenue: number;
        totalPayments: number;
    }[];
    activityStats: Record<string, { count: number; durationMinutes: number }>;
    summaryStats: {
        bookingCount: number;
        durationHours: number;
        allBookingsCompleted: boolean;
    };
}

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
            .select(`
                active,
                description,
                student!inner(
                    id,
                    first_name,
                    last_name,
                    country,
                    phone,
                    languages,
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
                                event(duration)
                            ),
                            student_booking_payment(amount)
                        )
                    )
                )
            `)
            .eq("school_id", schoolId);

        if (error) {
            console.error("Error fetching students table:", error);
            return [];
        }

        return data.map((ss: any) => {
            const student = ss.student;
            const activityStats: Record<string, { count: number; durationMinutes: number }> = {};
            let totalDurationMinutes = 0;
            let allBookingsCompleted = true;
            
            const bookings = student.booking_student.map((bs: any) => {
                const booking = bs.booking;
                const pkg = booking.school_package;
                
                if (booking.status !== "completed") {
                    allBookingsCompleted = false;
                }

                // Calculate stats from lessons/events
                const lessons = booking.lesson || [];
                const events = lessons.flatMap((l: any) => l.event || []);
                const eventCount = events.length;
                const bookingDurationMinutes = events.reduce((sum: number, e: any) => sum + e.duration, 0);
                totalDurationMinutes += bookingDurationMinutes;

                // Aggregate activity stats by category
                const category = pkg.category_equipment;
                if (!activityStats[category]) {
                    activityStats[category] = { count: 0, durationMinutes: 0 };
                }
                activityStats[category].count += eventCount;
                activityStats[category].durationMinutes += bookingDurationMinutes;

                // Revenue calculation (Total Booking Revenue vs Total Booking Payments)
                const pricePerHourPerStudent = (pkg.duration_minutes > 0) ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0;
                const bookingStudentCount = booking.booking_student ? booking.booking_student.length : 1;
                const expectedRevenue = pricePerHourPerStudent * (bookingDurationMinutes / 60) * bookingStudentCount;
                const totalPayments = booking.student_booking_payment.reduce((sum: number, p: any) => sum + p.amount, 0);

                return {
                    id: booking.id,
                    status: booking.status,
                    dateStart: booking.date_start,
                    dateEnd: booking.date_end,
                    packageName: pkg.description,
                    packageDetails: {
                        categoryEquipment: pkg.category_equipment,
                        capacityEquipment: pkg.capacity_equipment,
                        capacityStudents: pkg.capacity_students,
                        durationMinutes: pkg.duration_minutes,
                        pricePerStudent: pkg.price_per_student,
                    },
                    eventCount,
                    totalDurationHours: bookingDurationMinutes / 60,
                    expectedRevenue,
                    totalPayments,
                };
            });

            return {
                studentId: student.id,
                firstName: student.first_name,
                lastName: student.last_name,
                country: student.country,
                phone: student.phone,
                languages: student.languages,
                schoolStudentStatus: ss.active ? "active" : "inactive",
                schoolStudentDescription: ss.description,
                bookings,
                activityStats,
                summaryStats: {
                    bookingCount: bookings.length,
                    durationHours: totalDurationMinutes / 60,
                    allBookingsCompleted: bookings.length > 0 && allBookingsCompleted,
                }
            };
        });
    } catch (error) {
        console.error("Unexpected error in getStudentsTable:", error);
        return [];
    }
}
