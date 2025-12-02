import type { BookingModel } from "@/backend/models";

// ============ BOOKING STATS NAMESPACE ============
// Reads from pre-calculated stats in databoard models
// Falls back to relation traversal for non-databoard usage

export const BookingStats = {
    getMoneyIn: (booking: BookingModel): number => booking.stats?.money_in || 0,
    getMoneyOut: (booking: BookingModel): number => booking.stats?.money_out || 0,
    getEventsCount: (booking: BookingModel): number => booking.stats?.events_count || 0,
    getTotalHours: (booking: BookingModel): number => (booking.stats?.total_duration_minutes || 0) / 60,
    getRevenue: (booking: BookingModel): number => BookingStats.getMoneyIn(booking) - BookingStats.getMoneyOut(booking),
    getTeacherPayments: (booking: BookingModel): number => {
        const lessons = booking.relations?.lessons || [];
        return lessons.reduce((total, lesson) => {
            const payments = lesson.teacherLessonPayments || [];
            return total + payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        }, 0);
    },
    getStudentPayments: (booking: BookingModel): number => {
        const payments = booking.relations?.studentBookingPayments || [];
        return payments.reduce((total, payment) => total + (payment.amount || 0), 0);
    },
    getTeacherCommissions: (booking: BookingModel): number => {
        const lessons = booking.relations?.lessons || [];
        return lessons.reduce((total, lesson) => {
            const events = lesson.events || [];
            const durationMinutes = events.reduce((sum, event) => sum + (event.duration || 0), 0);
            const durationHours = durationMinutes / 60;
            const cph = parseFloat(lesson.commission?.cph || "0");
            return total + (durationHours * cph);
        }, 0);
    },
    getNetProfit: (booking: BookingModel): number => {
        const revenue = BookingStats.getMoneyIn(booking);
        const teacherPayments = BookingStats.getTeacherPayments(booking);
        const studentPayments = BookingStats.getStudentPayments(booking);
        const teacherCommissions = BookingStats.getTeacherCommissions(booking);
        return revenue - teacherPayments - studentPayments - teacherCommissions;
    },
};

// ============ LEGACY RELATION-BASED GETTERS ============
// Used for non-databoard contexts where stats aren't available

export function getBookingDuration(booking: BookingModel): number {
    const lessons = booking.relations?.lessons || [];
    let totalMinutes = 0;

    for (const lesson of lessons) {
        const events = lesson.events || [];
        for (const event of events) {
            totalMinutes += event.duration || 0;
        }
    }

    return totalMinutes;
}

export function getBookingDurationHours(booking: BookingModel): number {
    return Math.round(getBookingDuration(booking) / 60);
}

export function getBookingEventsCount(booking: BookingModel): number {
    const lessons = booking.relations?.lessons || [];
    let totalEvents = 0;

    for (const lesson of lessons) {
        totalEvents += lesson.events?.length || 0;
    }

    return totalEvents;
}

export function getBookingMoneyIn(booking: BookingModel): number {
    const studentPayments = booking.relations?.studentPayments || [];
    return studentPayments.reduce((total, payment) => total + (payment.amount || 0), 0);
}

export function getBookingMoneyOut(booking: BookingModel): number {
    const studentPackage = booking.relations?.studentPackage;
    const schoolPackage = studentPackage?.schoolPackage;

    if (!schoolPackage) return 0;

    const pricePerMinute = schoolPackage.pricePerStudent / schoolPackage.durationMinutes;
    const actualDuration = getBookingDuration(booking);

    return Math.round(actualDuration * pricePerMinute);
}

export function getBookingRevenue(booking: BookingModel): number {
    const moneyIn = getBookingMoneyIn(booking);
    const moneyOut = getBookingMoneyOut(booking);
    return moneyIn - moneyOut;
}

export function canBookingBeCompleted(booking: BookingModel): boolean {
    const studentPackage = booking.relations?.studentPackage;
    const schoolPackage = studentPackage?.schoolPackage;

    if (!schoolPackage) return false;

    const actualDurationMinutes = getBookingDuration(booking);
    const requiredDurationMinutes = schoolPackage.durationMinutes;

    return actualDurationMinutes >= requiredDurationMinutes;
}

export function getBookingCompletionPercentage(booking: BookingModel): number {
    const studentPackage = booking.relations?.studentPackage;
    const schoolPackage = studentPackage?.schoolPackage;

    if (!schoolPackage) return 0;

    const actualDurationMinutes = getBookingDuration(booking);
    const requiredDurationMinutes = schoolPackage.durationMinutes;

    return Math.round((actualDurationMinutes / requiredDurationMinutes) * 100);
}

export function getBookingDays(booking: BookingModel): number {
    return Math.ceil(
        (new Date(booking.schema.dateEnd).getTime() - new Date(booking.schema.dateStart).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;
}
