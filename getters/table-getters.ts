import { StudentData } from "@/backend/data/StudentData";

/**
 * Table Getters
 * Centralized logic for calculating stats and formatting data for the Master Tables views.
 * Works with the new Data structures (StudentData, TeacherData, etc.)
 */

export const StudentTableGetters = {
    getBookingCount: (student: StudentData): number => {
        return student.relations.bookings.length;
    },

    getEventCount: (student: StudentData): number => {
        return student.relations.bookings.reduce((sum, b) => {
            const lessons = b.lesson || [];
            const events = lessons.flatMap((l: any) => l.event || []);
            return sum + events.length;
        }, 0);
    },

    getTotalDurationMinutes: (student: StudentData): number => {
        return student.relations.bookings.reduce((sum, b) => {
            const lessons = b.lesson || [];
            const events = lessons.flatMap((l: any) => l.event || []);
            return sum + events.reduce((s: number, e: any) => s + (e.duration || 0), 0);
        }, 0);
    },

    getTotalPaid: (student: StudentData): number => {
        return student.relations.bookingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    },

    getExpectedRevenue: (student: StudentData): number => {
        return student.relations.bookings.reduce((sum, b) => {
            const pkg = b.school_package;
            if (!pkg) return sum;
            
            const lessons = b.lesson || [];
            const events = lessons.flatMap((l: any) => l.event || []);
            const bookingDurationHours = events.reduce((s: number, e: any) => s + (e.duration || 0), 0) / 60;
            
            const pricePerHour = (pkg.duration_minutes > 0) ? (pkg.price_per_student / (pkg.duration_minutes / 60)) : 0;
            return sum + (pricePerHour * bookingDurationHours);
        }, 0);
    },

    getProfit: (student: StudentData): number => {
        const paid = StudentTableGetters.getTotalPaid(student);
        const expected = StudentTableGetters.getExpectedRevenue(student);
        return paid - expected;
    }
};
