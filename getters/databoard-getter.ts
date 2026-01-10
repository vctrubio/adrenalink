import type { StudentModel, TeacherModel, BookingModel, EquipmentModel, SchoolPackageModel } from "@/backend/models";
import { calculateLessonRevenue, calculateCommission } from "@/getters/commission-calculator";
import { transformEventsToRows } from "@/getters/event-getter";
import { BookingStats } from "@/getters/bookings-getter";
import { EquipmentStats } from "@/getters/equipments-getter";
import type { EventData } from "@/types/booking-lesson-event";

// ========================
// STUDENT DATABOARD GETTERS
// ========================

export const StudentDataboard = {
    getBookingCount: (student: StudentModel): number => {
        const bookingStudents = student.relations?.bookingStudents || [];
        return bookingStudents.length;
    },

    getEventCount: (student: StudentModel): number => {
        const bookingStudents = student.relations?.bookingStudents || [];
        let totalEvents = 0;

        for (const bs of bookingStudents) {
            const booking = bs.booking;
            if (!booking) continue;

            const lessons = booking.lessons || [];
            for (const lesson of lessons) {
                const events = lesson.events || [];
                totalEvents += events.length;
            }
        }

        return totalEvents;
    },

    getDurationMinutes: (student: StudentModel): number => {
        const bookingStudents = student.relations?.bookingStudents || [];
        let totalDuration = 0;

        for (const bs of bookingStudents) {
            const booking = bs.booking;
            if (!booking) continue;

            const lessons = booking.lessons || [];
            for (const lesson of lessons) {
                const events = lesson.events || [];
                totalDuration += events.reduce((sum, event) => sum + (event.duration || 0), 0);
            }
        }

        return totalDuration;
    },

    getMoneyToPay: (student: StudentModel): number => {
        const bookingStudents = student.relations?.bookingStudents || [];
        let total = 0;

        for (const bs of bookingStudents) {
            const booking = bs.booking;
            if (!booking) continue;

            const pricePerStudent = booking.studentPackage?.schoolPackage?.pricePerStudent || 0;
            total += pricePerStudent;
        }

        return total;
    },

    getMoneyPaid: (student: StudentModel): number => {
        const bookingStudents = student.relations?.bookingStudents || [];
        let total = 0;

        for (const bs of bookingStudents) {
            const booking = bs.booking;
            if (!booking) continue;

            const bookingPayments = student.relations?.bookingPayments?.filter((bp) => bp.bookingId === booking.id) || [];
            total += bookingPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        }

        return total;
    },

    getProfit: (student: StudentModel): number => {
        const bookingStudents = student.relations?.bookingStudents || [];
        let totalRevenue = 0;
        let totalExpenses = 0;

        for (const bs of bookingStudents) {
            const booking = bs.booking;
            if (!booking) continue;

            const lessons = booking.lessons || [];
            const pricePerStudent = booking.studentPackage?.schoolPackage?.pricePerStudent || 0;
            const packageDurationMinutes = booking.studentPackage?.schoolPackage?.durationMinutes || 60;

            // 1. Calculate Revenue from lessons
            for (const lesson of lessons) {
                const events = (lesson.events || []) as EventData[];
                const studentCount = booking.bookingStudents?.length || 1;

                const eventRows = transformEventsToRows(events);
                for (const eventRow of eventRows) {
                    const eventRevenue = calculateLessonRevenue(
                        pricePerStudent,
                        studentCount,
                        eventRow.duration,
                        packageDurationMinutes,
                    );
                    totalRevenue += eventRevenue;
                }

                // 2. Calculate teacher commissions (part of Expenses)
                if (lesson.commission) {
                    const durationMinutes = events.reduce((sum, e) => sum + (e.duration || 0), 0);
                    const commissionCalc = calculateCommission(
                        durationMinutes,
                        {
                            type: lesson.commission.commissionType as "fixed" | "percentage",
                            cph: parseFloat(lesson.commission.cph || "0"),
                        },
                        totalRevenue, // This is a bit weird in the original code but I'll keep the logic consistent
                        packageDurationMinutes,
                    );
                    totalExpenses += commissionCalc.earned;
                }
            }

            // 3. Calculate referral commissions (part of Expenses)
            if (booking.studentPackage?.referral) {
                const referral = booking.studentPackage.referral;
                const bookingRevenue =
                    (pricePerStudent * lessons.flatMap((l) => l.events || []).reduce((sum, e) => sum + (e.duration || 0), 0)) /
                    packageDurationMinutes;

                if (referral.commissionType === "percentage") {
                    totalExpenses += (parseFloat(referral.commissionValue) / 100) * bookingRevenue;
                } else {
                    const totalHours = lessons.flatMap((l) => l.events || []).reduce((sum, e) => sum + (e.duration || 0), 0) / 60;
                    totalExpenses += parseFloat(referral.commissionValue) * totalHours;
                }
            }
        }

        return totalRevenue - totalExpenses;
    },
};

// ========================
// TEACHER DATABOARD GETTERS
// ========================

export const TeacherDataboard = {
    getLessonCount: (teacher: TeacherModel): number => {
        const lessons = teacher.relations?.lessons || [];
        return lessons.length;
    },

    getEventCount: (teacher: TeacherModel): number => {
        const lessons = teacher.relations?.lessons || [];
        let totalEvents = 0;

        for (const lesson of lessons) {
            const events = lesson.events || [];
            totalEvents += events.length;
        }

        return totalEvents;
    },

    getDurationMinutes: (teacher: TeacherModel): number => {
        const lessons = teacher.relations?.lessons || [];
        let totalDuration = 0;

        for (const lesson of lessons) {
            const events = lesson.events || [];
            totalDuration += events.reduce((sum, event) => sum + (event.duration || 0), 0);
        }

        return totalDuration;
    },

    getCommission: (teacher: TeacherModel): number => {
        const lessons = teacher.relations?.lessons || [];
        let totalCommission = 0;

        for (const lesson of lessons) {
            const events = lesson.events || [];
            const durationMinutes = events.reduce((sum, event) => sum + (event.duration || 0), 0);
            const totalHours = durationMinutes / 60;
            const cph = parseFloat(lesson.commission?.cph || "0");
            const commissionType = lesson.commission?.commissionType || "fixed";
            const commission = commissionType === "fixed" ? cph * totalHours : cph * totalHours;

            totalCommission += commission;
        }

        return totalCommission;
    },

    getRevenue: (teacher: TeacherModel): number => {
        const lessons = teacher.relations?.lessons || [];
        let totalRevenue = 0;

        for (const lesson of lessons) {
            const events = (lesson.events || []) as EventData[];
            const booking = lesson.booking;
            const schoolPackage = booking?.studentPackage?.schoolPackage;

            const eventRows = transformEventsToRows(events);
            const studentCount = booking?.bookingStudents?.length || 1;
            const pricePerStudent = schoolPackage?.pricePerStudent || 0;
            const packageDurationMinutes = schoolPackage?.durationMinutes || 60;

            for (const eventRow of eventRows) {
                totalRevenue += calculateLessonRevenue(pricePerStudent, studentCount, eventRow.duration, packageDurationMinutes);
            }
        }
        return totalRevenue;
    },

    getProfit: (teacher: TeacherModel): number => {
        const revenue = TeacherDataboard.getRevenue(teacher);
        const commission = TeacherDataboard.getCommission(teacher);
        return revenue - commission;
    },
};

// ========================
// BOOKING DATABOARD GETTERS
// ========================

export const BookingDataboard = {
    getLessonCount: (booking: BookingModel): number => booking.relations?.lessons?.length || 0,
    getEventCount: (booking: BookingModel): number => BookingStats.getEventsCount(booking),
    getDurationMinutes: (booking: BookingModel): number => booking.stats?.total_duration_minutes || 0,
    getRevenue: (booking: BookingModel): number => {
        return BookingStats.getRevenue(booking);
    },
    getExpenses: (booking: BookingModel): number => {
        return BookingStats.getExpenses(booking);
    },
    getProfit: (booking: BookingModel): number => {
        const revenue = BookingDataboard.getRevenue(booking);
        const expenses = BookingDataboard.getExpenses(booking);
        return revenue - expenses;
    },
};

export const EquipmentDataboard = {
    getLessonCount: (equipment: EquipmentModel): number => equipment.stats?.lessons_count || 0,
    getEventCount: (equipment: EquipmentModel): number => equipment.stats?.events_count || 0,
    getDurationMinutes: (equipment: EquipmentModel): number => equipment.stats?.total_duration_minutes || 0,
    getRevenue: (equipment: EquipmentModel): number => {
        return EquipmentStats.getRevenue(equipment);
    },
    getExpenses: (equipment: EquipmentModel): number => {
        return EquipmentStats.getExpenses(equipment);
    },
    getProfit: (equipment: EquipmentModel): number => {
        const revenue = EquipmentDataboard.getRevenue(equipment);
        const expenses = EquipmentDataboard.getExpenses(equipment);
        return revenue - expenses;
    },
};

// ========================
// SCHOOL PACKAGE DATABOARD GETTERS
// ========================

export const SchoolPackageDataboard = {
    getStudentCount: (schoolPackage: SchoolPackageModel): number => {
        return schoolPackage.stats?.student_count || 0;
    },

    getEventCount: (schoolPackage: SchoolPackageModel): number => {
        return schoolPackage.stats?.events_count || 0;
    },

    getDurationMinutes: (schoolPackage: SchoolPackageModel): number => {
        return schoolPackage.stats?.total_duration_minutes || 0;
    },

    getRevenue: (schoolPackage: SchoolPackageModel): number => {
        return schoolPackage.stats?.money_in || 0;
    },

    getProfit: (schoolPackage: SchoolPackageModel): number => {
        const studentPackages = schoolPackage.relations?.studentPackages || [];
        let totalRevenue = 0;
        let totalExpenses = 0;

        for (const sp of studentPackages) {
            const bookings = sp.bookings || [];
            const pricePerStudent = schoolPackage.schema.pricePerStudent;
            const packageDurationMinutes = schoolPackage.schema.durationMinutes;

            for (const booking of bookings) {
                const lessons = booking.lessons || [];
                const studentCount = booking.bookingStudents?.length || 1;

                for (const lesson of lessons) {
                    const events = lesson.events || [];
                    const lessonDuration = events.reduce((sum, e) => sum + (e.duration || 0), 0);

                    // 1. Revenue
                    totalRevenue += calculateLessonRevenue(pricePerStudent, studentCount, lessonDuration, packageDurationMinutes);

                    // 2. Teacher Commissions
                    if (lesson.commission) {
                        const commissionCalc = calculateCommission(
                            lessonDuration,
                            {
                                type: lesson.commission.commissionType as "fixed" | "percentage",
                                cph: parseFloat(lesson.commission.cph || "0"),
                            },
                            totalRevenue,
                            packageDurationMinutes,
                        );
                        totalExpenses += commissionCalc.earned;
                    }
                }

                // 3. Referral Commissions
                if (sp.referral) {
                    const referral = sp.referral;
                    const bookingDuration = lessons.flatMap((l) => l.events || []).reduce((sum, e) => sum + (e.duration || 0), 0);
                    const bookingRevenue = (pricePerStudent * bookingDuration) / packageDurationMinutes;

                    if (referral.commissionType === "percentage") {
                        totalExpenses += (parseFloat(referral.commissionValue) / 100) * bookingRevenue;
                    } else {
                        totalExpenses += parseFloat(referral.commissionValue) * (bookingDuration / 60);
                    }
                }
            }
        }

        return totalRevenue - totalExpenses;
    },
};
