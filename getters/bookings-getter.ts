import type { BookingModel } from "@/backend/models";

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
