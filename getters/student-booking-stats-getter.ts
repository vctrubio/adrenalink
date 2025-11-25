import type { StudentModel } from "@/backend/models";

export type BookingStatsData = {
    bookingId: string;
    dateStart: Date;
    dateEnd: Date;
    eventsCount: number;
    durationHours: number;
    paymentsCount: number;
    moneyIn: number;
    moneyOut: number;
    status: string;
    // Package info
    packageDescription: string;
    packageDurationMinutes: number;
    packagePricePerHour: number;
    packageCapacityStudents: number;
    // Balance calculations
    moneyToPay: number;      // Calculated from events
    moneyPaid: number;       // Sum of student_booking_payment
    balance: number;         // moneyToPay - moneyPaid
};

export type GlobalStatsType = {
    eventsCount: number;
    durationHours: number;
    paymentsCount: number;
    moneyIn: number;
    moneyOut: number;
    moneyToPay: number;
    moneyPaid: number;
    balance: number;
};

// Main getter
export function getBookingStatsData(student: StudentModel): BookingStatsData[] {
    const bookingStudents = student.relations?.bookingStudents || [];

    return bookingStudents.map((bs) => {
        const booking = bs.booking;
        const schoolPackage = booking?.studentPackage?.schoolPackage;

        // Get payment data for this booking
        const paymentsCount = getBookingPaymentsCount(student, booking.id);
        const moneyPaid = getBookingPaymentsTotal(student, booking.id);

        // Calculate money to pay based on actual event duration
        const totalDurationMinutes = booking.stats?.total_duration_minutes || 0;
        const pricePerHour = schoolPackage?.pricePerHour || 0;
        const capacityStudents = schoolPackage?.capacityStudents || 1;
        const moneyToPay = (totalDurationMinutes / 60) * pricePerHour * capacityStudents;

        return {
            bookingId: booking.id,
            dateStart: booking.dateStart,
            dateEnd: booking.dateEnd,
            eventsCount: booking.stats?.events_count || 0,
            durationHours: totalDurationMinutes / 60,
            paymentsCount,
            moneyIn: booking.stats?.money_in || 0,
            moneyOut: booking.stats?.money_out || 0,
            status: booking.status || "active",
            // Package info
            packageDescription: schoolPackage?.description || "No package",
            packageDurationMinutes: schoolPackage?.durationMinutes || 0,
            packagePricePerHour: pricePerHour,
            packageCapacityStudents: capacityStudents,
            // Balance
            moneyToPay,
            moneyPaid,
            balance: moneyToPay - moneyPaid,
        };
    });
}

// Helper: Count payments for specific booking
function getBookingPaymentsCount(student: StudentModel, bookingId: string): number {
    const payments = student.relations?.bookingPayments || [];
    return payments.filter(p => p.bookingId === bookingId).length;
}

// Helper: Total amount paid for specific booking
function getBookingPaymentsTotal(student: StudentModel, bookingId: string): number {
    const payments = student.relations?.bookingPayments || [];
    return payments
        .filter(p => p.bookingId === bookingId)
        .reduce((sum, p) => sum + (p.amount || 0), 0);
}

// Calculate global totals
export function getGlobalStats(bookings: BookingStatsData[]): GlobalStatsType {
    return bookings.reduce((acc, b) => ({
        eventsCount: acc.eventsCount + b.eventsCount,
        durationHours: acc.durationHours + b.durationHours,
        paymentsCount: acc.paymentsCount + b.paymentsCount,
        moneyIn: acc.moneyIn + b.moneyIn,
        moneyOut: acc.moneyOut + b.moneyOut,
        moneyToPay: acc.moneyToPay + b.moneyToPay,
        moneyPaid: acc.moneyPaid + b.moneyPaid,
        balance: acc.balance + b.balance,
    }), {
        eventsCount: 0,
        durationHours: 0,
        paymentsCount: 0,
        moneyIn: 0,
        moneyOut: 0,
        moneyToPay: 0,
        moneyPaid: 0,
        balance: 0,
    });
}
