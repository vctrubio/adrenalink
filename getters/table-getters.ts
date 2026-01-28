import { StudentData } from "@/backend/data/StudentData";
import { TeacherData } from "@/backend/data/TeacherData";
import { BookingData } from "@/backend/data/BookingData";
import { PackageData } from "@/backend/data/PackageData";
import { EquipmentData } from "@/backend/data/EquipmentData";
import { safeArray } from "@/backend/error-handlers";

/**
 * Table Getters
 * Centralized logic for calculating stats and formatting data for the Master Tables views.
 * Works with the new Data structures (StudentData, TeacherData, BookingData, PackageData, EquipmentData, etc.)
 */

export const EquipmentTableGetters = {
    getEventCount: (equipment: EquipmentData): number => {
        return safeArray(equipment.relations.events).length;
    },

    getRentalCount: (equipment: EquipmentData): number => {
        return safeArray(equipment.relations.rentals).length;
    },

    getRepairCount: (equipment: EquipmentData): number => {
        return safeArray(equipment.relations.repairs).length;
    },

    getTotalUsageMinutes: (equipment: EquipmentData): number => {
        return safeArray(equipment.relations.events).reduce((sum, e) => sum + (e.duration || 0), 0);
    },

    getTotalRentalMinutes: (equipment: EquipmentData): number => {
        return safeArray(equipment.relations.rentals).reduce((sum, r) => sum + (r.duration || 0), 0);
    },

    getRevenue: (equipment: EquipmentData): number => {
        return safeArray(equipment.relations.events).reduce((total, event) => {
            const pkg = event.lesson?.booking?.school_package;
            if (!pkg || pkg.duration_minutes === 0) return total;

            const pricePerMinute = pkg.price_per_student / pkg.duration_minutes;
            const eventRevenue = pricePerMinute * (event.duration || 0) * (pkg.capacity_students || 1);

            return total + eventRevenue;
        }, 0);
    },
};

export const PackageTableGetters = {
    getBookingCount: (pkg: PackageData): number => {
        return safeArray(pkg.relations.bookings).length;
    },

    getRequestCount: (pkg: PackageData): number => {
        return safeArray(pkg.relations.requests).length;
    },

    getTotalStudents: (pkg: PackageData): number => {
        return safeArray(pkg.relations.bookings).reduce((sum, b) => sum + safeArray(b.students).length, 0);
    },

    getRevenue: (pkg: PackageData): number => {
        const pricePerStudent = pkg.schema.price_per_student;
        const totalStudents = PackageTableGetters.getTotalStudents(pkg);
        return totalStudents * pricePerStudent;
    },
};

export const BookingTableGetters = {
    getUsedMinutes: (booking: BookingData): number => {
        return safeArray(booking.relations.lessons).reduce((sum, l) => {
            return sum + safeArray(l.event).reduce((s: number, e: any) => s + (e.duration || 0), 0);
        }, 0);
    },

    getTotalMinutes: (booking: BookingData): number => {
        return booking.relations.school_package?.duration_minutes || 0;
    },

    getRevenue: (booking: BookingData): number => {
        const pkg = booking.relations.school_package;
        if (!pkg) return 0;

        const usedMinutes = BookingTableGetters.getUsedMinutes(booking);
        const durationHours = usedMinutes / 60;
        const studentCount = safeArray(booking.relations.students).length || 1;

        const pricePerHourPerStudent = pkg.duration_minutes > 0 ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0;
        return pricePerHourPerStudent * durationHours * studentCount;
    },

    getCommissions: (booking: BookingData): number => {
        return safeArray(booking.relations.lessons).reduce((sum, l) => {
            const usedMinutes = safeArray(l.event).reduce((s: number, e: any) => s + (e.duration || 0), 0);
            const durationHours = usedMinutes / 60;
            const cph = parseFloat(l.teacher_commission?.cph || "0");
            const type = l.teacher_commission?.commission_type || "fixed";

            if (type === "fixed") return sum + cph * durationHours;

            // Percentage based on lesson revenue
            const pkg = booking.relations.school_package;
            if (!pkg) return sum;
            const studentCount = safeArray(booking.relations.students).length || 1;
            const pricePerHourPerStudent = pkg.duration_minutes > 0 ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0;
            const lessonRevenue = pricePerHourPerStudent * durationHours * studentCount;

            return sum + lessonRevenue * (cph / 100);
        }, 0);
    },

    getBalance: (booking: BookingData): number => {
        return BookingTableGetters.getRevenue(booking) - BookingTableGetters.getCommissions(booking);
    },

    getPaidAmount: (booking: BookingData): number => {
        return safeArray(booking.relations.student_booking_payment).reduce((sum, p) => sum + (p.amount || 0), 0);
    },

    getDueAmount: (booking: BookingData): number => {
        return BookingTableGetters.getRevenue(booking) - BookingTableGetters.getPaidAmount(booking);
    },
};

export const StudentTableGetters = {
    getBookingCount: (student: StudentData): number => {
        return safeArray(student.bookings).length;
    },

    getEventCount: (student: StudentData): number => {
        return safeArray(student.bookings).reduce((sum, b) => {
            const lessons = safeArray(b.lessons);
            const events = lessons.flatMap((l: any) => safeArray(l.events?.details));
            return sum + events.length;
        }, 0);
    },

    getTotalDurationMinutes: (student: StudentData): number => {
        return safeArray(student.bookings).reduce((sum, b) => {
            const lessons = safeArray(b.lessons);
            const events = lessons.flatMap((l: any) => safeArray(l.events?.details));
            return sum + events.reduce((s: number, e: any) => s + (e.duration || 0), 0);
        }, 0);
    },

    getTotalPaid: (student: StudentData): number => {
        return safeArray(student.bookings).reduce((sum, booking) => sum + (booking.stats?.payments?.student || 0), 0);
    },

    getExpectedRevenue: (student: StudentData): number => {
        return safeArray(student.bookings).reduce((sum, b) => {
            const pkg = b.packageDetails;
            if (!pkg) return sum;

            const lessons = safeArray(b.lessons);
            const events = lessons.flatMap((l: any) => safeArray(l.events?.details));
            const bookingDurationHours = events.reduce((s: number, e: any) => s + (e.duration || 0), 0) / 60;

            const pricePerHour = pkg.durationMinutes > 0 ? pkg.pricePerStudent / (pkg.durationMinutes / 60) : 0;
            return sum + pricePerHour * bookingDurationHours;
        }, 0);
    },

    getProfit: (student: StudentData): number => {
        const paid = StudentTableGetters.getTotalPaid(student);
        const expected = StudentTableGetters.getExpectedRevenue(student);
        return paid - expected;
    },
};

export const TeacherTableGetters = {
    getLessonCount: (teacher: TeacherData): number => {
        return safeArray(teacher.relations.lesson).length;
    },

    getEventCount: (teacher: TeacherData): number => {
        return safeArray(teacher.relations.lesson).reduce((sum, l) => sum + safeArray(l.event).length, 0);
    },

    getTotalDurationMinutes: (teacher: TeacherData): number => {
        const result = safeArray(teacher.relations.lesson).reduce((sum, l) => {
            return sum + safeArray(l.event).reduce((s: number, e: any) => s + (parseFloat(e.duration) || 0), 0);
        }, 0);
        return isNaN(result) ? 0 : result;
    },

    getCommissionEarned: (teacher: TeacherData): number => {
        const result = safeArray(teacher.relations.lesson).reduce((sum, l) => {
            const pkg = l.booking?.school_package;
            if (!pkg) return sum;

            const durationMinutes = safeArray(l.event).reduce((s: number, e: any) => s + (parseFloat(e.duration) || 0), 0);
            const durationHours = durationMinutes / 60;

            const studentCount = pkg.capacity_students || 1;
            const pricePerHourPerStudent = pkg.duration_minutes > 0 ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0;
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
        return isNaN(result) ? 0 : result;
    },

    getProfit: (teacher: TeacherData): number => {
        // School Profit from this teacher = Total Revenue Generated - Commissions Earned
        const result = safeArray(teacher.relations.lesson).reduce((sum, l) => {
            const pkg = l.booking?.school_package;
            if (!pkg) return sum;

            const durationMinutes = safeArray(l.event).reduce((s: number, e: any) => s + (parseFloat(e.duration) || 0), 0);
            const durationHours = durationMinutes / 60;

            const studentCount = pkg.capacity_students || 1;
            const pricePerHourPerStudent = pkg.duration_minutes > 0 ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0;
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
        return isNaN(result) ? 0 : result;
    },
};
