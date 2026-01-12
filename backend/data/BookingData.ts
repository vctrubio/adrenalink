import type { BookingWithLessonAndPayments, BookingTableStats } from "@/config/tables";

/**
 * Calculate stats from a single booking
 * Returns grouped stats by category
 */
export function calculateBookingStats(booking: BookingWithLessonAndPayments): BookingTableStats {
    const { package: pkg, lessons, payments } = booking;

    // Events stats - calculate statusCounts based on minutes
    const allEventDetails = lessons.flatMap((l) => l.events.details || []);
    const statusCounts = {
        planned: allEventDetails.filter((d) => d.status === "planned").reduce((sum, d) => sum + d.duration, 0),
        tbc: allEventDetails.filter((d) => d.status === "tbc").reduce((sum, d) => sum + d.duration, 0),
        completed: allEventDetails.filter((d) => d.status === "completed").reduce((sum, d) => sum + d.duration, 0),
        uncompleted: allEventDetails.filter((d) => d.status === "uncompleted").reduce((sum, d) => sum + d.duration, 0),
    };

    const eventCount = lessons.reduce((sum, lesson) => sum + lesson.events.totalCount, 0);
    const eventDuration = lessons.reduce((sum, lesson) => sum + lesson.events.totalDuration, 0) / 60; // convert to hours
    const eventRevenue = pkg.pph * eventDuration * pkg.capacityStudents || 0;

    // Payments stats
    const studentPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const teacherPayments = lessons.reduce((sum, lesson) => sum + lesson.teacherPayments, 0);

    // Teacher commissions
    const teacherCommissions = lessons.reduce((sum, lesson) => {
        const { commission, events } = lesson;
        const duration = events.totalDuration / 60;
        if (commission.type === "fixed") {
            return sum + parseFloat(commission.cph) * duration;
        } else {
            const lessonRevenue = pkg.pph * duration * pkg.capacityStudents;
            return sum + lessonRevenue * (parseFloat(commission.cph) / 100);
        }
    }, 0);

    // Balance = event revenue - teacher commissions
    const balance = eventRevenue - teacherCommissions;

    return {
        events: {
            count: eventCount,
            duration: eventDuration,
            revenue: eventRevenue,
            statusCounts,
        },
        payments: {
            student: studentPayments,
            teacher: teacherPayments,
        },
        commissions: teacherCommissions,
        balance,
    };
}
