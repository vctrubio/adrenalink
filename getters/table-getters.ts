import { StudentData } from "@/backend/data/StudentData";
import { TeacherData } from "@/backend/data/TeacherData";
import { BookingData } from "@/backend/data/BookingData";
import { PackageData } from "@/backend/data/PackageData";
import { EquipmentData } from "@/backend/data/EquipmentData";

/**
 * Table Getters
 * Centralized logic for calculating stats and formatting data for the Master Tables views.
 * Works with the new Data structures (StudentData, TeacherData, BookingData, PackageData, EquipmentData, etc.)
 */

export const EquipmentTableGetters = {
    getEventCount: (equipment: EquipmentData): number => {
        return equipment.relations.events.length;
    },

    getRentalCount: (equipment: EquipmentData): number => {
        return equipment.relations.rentals.length;
    },

    getRepairCount: (equipment: EquipmentData): number => {
        return equipment.relations.repairs.length;
    },

    getTotalUsageMinutes: (equipment: EquipmentData): number => {
        return equipment.relations.events.reduce((sum, e) => sum + (e.duration || 0), 0);
    },

    getRevenue: (equipment: EquipmentData): number => {
        return equipment.relations.events.reduce((total, event) => {
            const pkg = event.lesson?.booking?.school_package;
            if (!pkg || pkg.duration_minutes === 0) return total;

            const pricePerMinute = pkg.price_per_student / pkg.duration_minutes;
            const eventRevenue = pricePerMinute * (event.duration || 0) * (pkg.capacity_students || 1);
            
            return total + eventRevenue;
        }, 0);
    }
};

export const PackageTableGetters = {
    getBookingCount: (pkg: PackageData): number => {
        return pkg.relations.bookings.length;
    },

    getRequestCount: (pkg: PackageData): number => {
        return pkg.relations.requests.length;
    },

    getTotalStudents: (pkg: PackageData): number => {
        return pkg.relations.bookings.reduce((sum, b) => sum + (b.students?.length || 0), 0);
    },

    getRevenue: (pkg: PackageData): number => {
        const pricePerStudent = pkg.schema.price_per_student;
        const totalStudents = PackageTableGetters.getTotalStudents(pkg);
        return totalStudents * pricePerStudent;
    }
};

export const BookingTableGetters = {
    getUsedMinutes: (booking: BookingData): number => {
        return booking.relations.lessons.reduce((sum, l) => {
            return sum + (l.events?.reduce((s: number, e: any) => s + (e.duration || 0), 0) || 0);
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
        const studentCount = booking.relations.students.length || 1;

        const pricePerHourPerStudent = (pkg.duration_minutes > 0) ? (pkg.price_per_student / (pkg.duration_minutes / 60)) : 0;
        return pricePerHourPerStudent * durationHours * studentCount;
    },

    getPaidAmount: (booking: BookingData): number => {
        return booking.relations.student_booking_payment.reduce((sum, p) => sum + (p.amount || 0), 0);
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
            const lessons = b.lessons || [];
            const events = lessons.flatMap((l: any) => l.event || l.events || []);
            return sum + events.length;
        }, 0);
    },

    getTotalDurationMinutes: (student: StudentData): number => {
        return student.relations.bookings.reduce((sum, b) => {
            const lessons = b.lessons || [];
            const events = lessons.flatMap((l: any) => l.event || l.events || []);
            return sum + events.reduce((s: number, e: any) => s + (e.duration || 0), 0);
        }, 0);
    },

    getTotalPaid: (student: StudentData): number => {
        return student.relations.student_booking_payment.reduce((sum, p) => sum + (p.amount || 0), 0);
    },

    getExpectedRevenue: (student: StudentData): number => {
        return student.relations.bookings.reduce((sum, b) => {
            const pkg = b.school_package;
            if (!pkg) return sum;
            
            const lessons = b.lessons || [];
            const events = lessons.flatMap((l: any) => l.event || l.events || []);
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
        return teacher.relations.lesson.length;
    },

    getEventCount: (teacher: TeacherData): number => {
        return teacher.relations.lesson.reduce((sum, l) => sum + (l.event?.length || 0), 0);
    },

    getTotalDurationMinutes: (teacher: TeacherData): number => {
        return teacher.relations.lesson.reduce((sum, l) => {
            return sum + (l.event?.reduce((s: number, e: any) => s + (e.duration || 0), 0) || 0);
        }, 0);
    },

    getCommissionEarned: (teacher: TeacherData): number => {
        return teacher.relations.lesson.reduce((sum, l) => {
            const pkg = l.booking?.school_package;
            if (!pkg) return sum;

            const durationMinutes = l.event?.reduce((s: number, e: any) => s + (e.duration || 0), 0) || 0;
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
        return teacher.relations.lesson.reduce((sum, l) => {
            const pkg = l.booking?.school_package;
            if (!pkg) return sum;

            const durationMinutes = l.event?.reduce((s: number, e: any) => s + (e.duration || 0), 0) || 0;
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