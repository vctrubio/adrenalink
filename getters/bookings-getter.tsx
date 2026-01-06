import type { BookingModel } from "@/backend/models";
import { calculateCommission, calculateLessonRevenue, type CommissionInfo } from "./commission-calculator";

// ============ BOOKING STATS NAMESPACE ============
// Reads from pre-calculated stats in databoard models
// Falls back to relation traversal for non-databoard usage

export const BookingStats = {
    getRevenue: (booking: BookingModel): number => booking.stats?.money_in || 0,
    getExpenses: (booking: BookingModel): number => booking.stats?.money_out || 0,
    getEventsCount: (booking: BookingModel): number => booking.stats?.events_count || 0,
    getTotalHours: (booking: BookingModel): number => (booking.stats?.total_duration_minutes || 0) / 60,
    getProfit: (booking: BookingModel): number => BookingStats.getRevenue(booking) - BookingStats.getExpenses(booking),
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
        const lessons = booking.relations?.lessons;
        if (!lessons) throw new Error(`Booking ${booking.schema.id} has no lessons loaded`);

        const schoolPackage = booking.relations?.studentPackage?.schoolPackage;
        if (!schoolPackage) throw new Error(`Booking ${booking.schema.id} has no schoolPackage loaded`);

        const pricePerStudent = schoolPackage.pricePerStudent;
        const packageDurationMinutes = schoolPackage.durationMinutes;
        
        const studentCount = booking.relations?.bookingStudents?.length;
        if (studentCount === undefined) throw new Error(`Booking ${booking.schema.id} has no bookingStudents loaded`);

        return lessons.reduce((total, lesson) => {
            const events = lesson.events || [];
            const lessonDurationMinutes = events.reduce((sum, event) => sum + (event.duration || 0), 0);
            
            // Calculate revenue portion for this lesson (based on duration and student count)
            const lessonRevenue = calculateLessonRevenue(
                pricePerStudent,
                studentCount,
                lessonDurationMinutes,
                packageDurationMinutes
            );

            if (!lesson.commission) throw new Error(`Lesson ${lesson.id} has no commission data`);

            // Construct CommissionInfo object (handling potential missing/wrong types)
            const commissionInfo: CommissionInfo = {
                type: (lesson.commission.commissionType as "fixed" | "percentage"),
                cph: parseFloat(lesson.commission.cph)
            };

            const commissionResult = calculateCommission(
                lessonDurationMinutes,
                commissionInfo,
                lessonRevenue,
                packageDurationMinutes
            );
            
            return total + commissionResult.earned;
        }, 0);
    },
    getNetProfit: (booking: BookingModel): number => {
        const revenue = BookingStats.getRevenue(booking);
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

export function getBookingRevenue(booking: BookingModel): number {
    const studentPayments = booking.relations?.studentPayments || [];
    return studentPayments.reduce((total, payment) => total + (payment.amount || 0), 0);
}

export function getBookingExpenses(booking: BookingModel): number {
    const studentPackage = booking.relations?.studentPackage;
    const schoolPackage = studentPackage?.schoolPackage;

    if (!schoolPackage) return 0;

    const pricePerMinute = schoolPackage.pricePerStudent / schoolPackage.durationMinutes;
    const actualDuration = getBookingDuration(booking);

    return Math.round(actualDuration * pricePerMinute);
}

export function getBookingProfit(booking: BookingModel): number {
    const revenue = getBookingRevenue(booking);
    const expenses = getBookingExpenses(booking);
    return revenue - expenses;
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

export function getBookingStudentNames(booking: BookingModel): string {
    const bookingStudents = booking.relations?.bookingStudents || [];
    const studentNames = bookingStudents.map((bs) => (bs.student ? `${bs.student.firstName} ${bs.student.lastName}` : "Unknown"));
    return studentNames.join(" ");
}

/**
 * Returns a React element representing the leader name and additional student count
 * Reusable for tables and lists
 */
export function getLeaderCapacity(leaderName: string, totalStudents: number) {
    if (totalStudents <= 1) {
        return (
            <span className="text-foreground font-semibold">
                {leaderName}
            </span>
        );
    }

    return (
        <span className="text-foreground flex items-center">
            <span className="font-semibold">{leaderName}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground ml-1.5">
                +{totalStudents - 1}
            </span>
        </span>
    );
}