import type { BookingTableData } from "@/supabase/server/bookings";
import type { BookingTableStats } from "@/config/tables";

/**
 * Aggregates statistics for a list of bookings
 */
export function getAggregateBookings(bookings: BookingTableData[]): BookingTableStats & { totalBookings: number } {
    return bookings.reduce(
        (acc, curr) => {
            return {
                totalBookings: acc.totalBookings + 1,
                events: {
                    count: acc.events.count + curr.stats.events.count,
                    duration: acc.events.duration + curr.stats.events.duration,
                    revenue: acc.events.revenue + curr.stats.events.revenue,
                },
                payments: {
                    student: acc.payments.student + curr.stats.payments.student,
                    teacher: acc.payments.teacher + curr.stats.payments.teacher,
                },
                commissions: acc.commissions + curr.stats.commissions,
                balance: acc.balance + curr.stats.balance,
            };
        },
        {
            totalBookings: 0,
            events: { count: 0, duration: 0, revenue: 0 },
            payments: { student: 0, teacher: 0 },
            commissions: 0,
            balance: 0,
        },
    );
}
