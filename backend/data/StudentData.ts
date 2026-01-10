import type { StudentWithBookingsAndPayments, StudentTableStats } from "@/config/tables";

/**
 * Calculate stats for a single student record
 */
export function calculateStudentStats(student: StudentWithBookingsAndPayments): StudentTableStats & { allBookingsCompleted: boolean } {
    const stats = student.bookings.reduce(
        (acc, b) => ({
            totalBookings: acc.totalBookings + 1,
            totalEvents: acc.totalEvents + b.stats.events.count,
            totalDurationMinutes: acc.totalDurationMinutes + b.stats.events.duration * 60,
            totalRevenue: acc.totalRevenue + b.stats.events.revenue,
            totalPayments: acc.totalPayments + b.stats.payments.student,
        }),
        {
            totalBookings: 0,
            totalEvents: 0,
            totalDurationMinutes: 0,
            totalRevenue: 0,
            totalPayments: 0,
        },
    );

    // Check if there are any active bookings
    const hasActiveBooking = student.bookings.some((b) => b.status === "active");

    return {
        ...stats,
        allBookingsCompleted: !hasActiveBooking,
    };
}
