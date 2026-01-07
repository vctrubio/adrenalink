import { StudentData } from "@/backend/data/StudentData";
import { TeacherData } from "@/backend/data/TeacherData";
import { BookingData } from "@/backend/data/BookingData";

/**
 * Table Getters
 * Centralized logic for calculating stats and formatting data for the Master Tables views.
 * Works with the new Data structures (StudentData, TeacherData, BookingData, etc.)
 */

export const BookingTableGetters = {
    getUsedMinutes: (booking: BookingData): number => {
        return booking.relations.lessons.reduce((sum, l) => {
            return sum + (l.events?.reduce((s: number, e: any) => s + (e.duration || 0), 0) || 0);
        }, 0);
    },

    getTotalMinutes: (booking: BookingData): number => {
        return booking.relations.schoolPackage?.duration_minutes || 0;
    },

    getRevenue: (booking: BookingData): number => {
        const pkg = booking.relations.schoolPackage;
        if (!pkg) return 0;

        const usedMinutes = BookingTableGetters.getUsedMinutes(booking);
        const durationHours = usedMinutes / 60;
        const studentCount = booking.relations.students.length || 1;

        const pricePerHourPerStudent = (pkg.duration_minutes > 0) ? (pkg.price_per_student / (pkg.duration_minutes / 60)) : 0;
        return pricePerHourPerStudent * durationHours * studentCount;
    },

    getPaidAmount: (booking: BookingData): number => {
        return booking.relations.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    },

    getDueAmount: (booking: BookingData): number => {
        return BookingTableGetters.getRevenue(booking) - BookingTableGetters.getPaidAmount(booking);
    }
};

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

export const TeacherTableGetters = {
    getLessonCount: (teacher: TeacherData): number => {
        return teacher.relations.lessons.length;
    },

    getEventCount: (teacher: TeacherData): number => {
        return teacher.relations.lessons.reduce((sum, l) => sum + (l.events?.length || 0), 0);
    },

    getTotalDurationMinutes: (teacher: TeacherData): number => {
        return teacher.relations.lessons.reduce((sum, l) => {
            return sum + (l.events?.reduce((s: number, e: any) => s + (e.duration || 0), 0) || 0);
        }, 0);
    },

    getCommissionEarned: (teacher: TeacherData): number => {
        return teacher.relations.lessons.reduce((sum, l) => {
            const pkg = l.booking?.school_package;
            if (!pkg) return sum;

            const durationMinutes = l.events?.reduce((s: number, e: any) => s + (e.duration || 0), 0) || 0;
            const durationHours = durationMinutes / 60;
            
            const studentCount = pkg.capacity_students || 1;
            const pricePerHourPerStudent = (pkg.duration_minutes > 0) ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0;
            const lessonRevenue = pricePerHourPerStudent * durationHours * studentCount;

            const cph = parseFloat(l.teacher_commission?.cph || "0");
            const type = l.teacher_commission?.commission_type || "fixed";

            let earned = 0;
            if (type === "fixed") {
                earned = cph * durationHours;
            } else if (type === "percentage") {
                earned = lessonRevenue * (cph / 100);
            }
            return sum + earned;
        }, 0);
    },

    getProfit: (teacher: TeacherData): number => {
        // School Profit from this teacher = Total Revenue Generated - Commissions Earned
        return teacher.relations.lessons.reduce((sum, l) => {
            const pkg = l.booking?.school_package;
            if (!pkg) return sum;

            const durationMinutes = l.events?.reduce((s: number, e: any) => s + (e.duration || 0), 0) || 0;
            const durationHours = durationMinutes / 60;
            
            const studentCount = pkg.capacity_students || 1;
            const pricePerHourPerStudent = (pkg.duration_minutes > 0) ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0;
            const lessonRevenue = pricePerHourPerStudent * durationHours * studentCount;

            const cph = parseFloat(l.teacher_commission?.cph || "0");
            const type = l.teacher_commission?.commission_type || "fixed";

            let earned = 0;
            if (type === "fixed") {
                earned = cph * durationHours;
            } else if (type === "percentage") {
                earned = lessonRevenue * (cph / 100);
            }
            
            return sum + (lessonRevenue - earned);
        }, 0);
    }
};

