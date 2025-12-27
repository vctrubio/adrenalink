import type { StudentModel, TeacherModel, BookingModel, EquipmentModel, SchoolPackageModel } from "@/backend/models";
import { calculateLessonRevenue, calculateCommission } from "@/getters/commission-calculator";
import { transformEventsToRows } from "@/getters/event-getter";
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

            const bookingPayments = student.relations?.bookingPayments?.filter(
                (bp) => bp.bookingId === booking.id
            ) || [];
            total += bookingPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        }

        return total;
    },

    getSchoolNet: (student: StudentModel): number => {
        const bookingStudents = student.relations?.bookingStudents || [];
        let totalRevenue = 0;
        let totalTeacherCommission = 0;

        for (const bs of bookingStudents) {
            const booking = bs.booking;
            if (!booking) continue;

            const lessons = booking.lessons || [];
            const pricePerStudent = booking.studentPackage?.schoolPackage?.pricePerStudent || 0;
            const packageDurationMinutes = booking.studentPackage?.schoolPackage?.durationMinutes || 60;

            for (const lesson of lessons) {
                const events = (lesson.events || []) as EventData[];
                const studentCount = booking.bookingStudents?.length || 1;

                // Calculate revenue from this lesson's events
                const eventRows = transformEventsToRows(events);
                for (const eventRow of eventRows) {
                    const eventRevenue = calculateLessonRevenue(
                        pricePerStudent,
                        studentCount,
                        eventRow.duration,
                        packageDurationMinutes
                    );
                    totalRevenue += eventRevenue;
                }

                // Calculate teacher commission for this lesson
                if (lesson.commission) {
                    const durationMinutes = events.reduce((sum, e) => sum + (e.duration || 0), 0);
                    const commissionCalc = calculateCommission(
                        durationMinutes,
                        {
                            type: lesson.commission.commissionType as "fixed" | "percentage",
                            cph: parseFloat(lesson.commission.cph || "0"),
                        },
                        totalRevenue,
                        packageDurationMinutes
                    );
                    totalTeacherCommission += commissionCalc.earned;
                }
            }
        }

        // School Net = Revenue - Teacher Commission (referral commission not yet implemented)
        return totalRevenue - totalTeacherCommission;
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

    getSchoolRevenue: (teacher: TeacherModel): number => {
        const lessons = teacher.relations?.lessons || [];
        let totalRevenue = 0;
        let totalCommission = 0;

        for (const lesson of lessons) {
            const events = (lesson.events || []) as EventData[];
            const booking = lesson.booking;
            const schoolPackage = booking?.studentPackage?.schoolPackage;

            const durationMinutes = events.reduce((sum, e) => sum + (e.duration || 0), 0);
            const totalHours = durationMinutes / 60;
            const cph = parseFloat(lesson.commission?.cph || "0");
            const commissionType = lesson.commission?.commissionType || "fixed";
            const commission = commissionType === "fixed" ? cph * totalHours : cph * totalHours;

            totalCommission += commission;

            const eventRows = transformEventsToRows(events);
            const studentCount = booking?.bookingStudents?.length || 1;
            const pricePerStudent = schoolPackage?.pricePerStudent || 0;
            const packageDurationMinutes = schoolPackage?.durationMinutes || 60;

            for (const eventRow of eventRows) {
                const eventRevenue = calculateLessonRevenue(
                    pricePerStudent,
                    studentCount,
                    eventRow.duration,
                    packageDurationMinutes
                );
                totalRevenue += eventRevenue;
            }
        }

        return totalRevenue - totalCommission;
    },
};

// ========================
// BOOKING DATABOARD GETTERS
// ========================

export const BookingDataboard = {
    getEventCount: (booking: BookingModel): number => {
        return booking.stats?.events_count || 0;
    },

    getDurationMinutes: (booking: BookingModel): number => {
        return booking.stats?.total_duration_minutes || 0;
    },

    getMoneyIn: (booking: BookingModel): number => {
        return booking.stats?.money_in || 0;
    },

    getMoneyOut: (booking: BookingModel): number => {
        return booking.stats?.money_out || 0;
    },

    getRevenue: (booking: BookingModel): number => {
        const moneyIn = BookingDataboard.getMoneyIn(booking);
        const moneyOut = BookingDataboard.getMoneyOut(booking);
        return moneyIn - moneyOut;
    },
};

// ========================
// EQUIPMENT DATABOARD GETTERS
// ========================

export const EquipmentDataboard = {
    getEventCount: (equipment: EquipmentModel): number => {
        return equipment.stats?.events_count || 0;
    },

    getDurationMinutes: (equipment: EquipmentModel): number => {
        return equipment.stats?.total_duration_minutes || 0;
    },

    getRentalsCount: (equipment: EquipmentModel): number => {
        return equipment.stats?.rentals_count || 0;
    },

    getMoneyIn: (equipment: EquipmentModel): number => {
        return equipment.stats?.money_in || 0;
    },

    getMoneyOut: (equipment: EquipmentModel): number => {
        return equipment.stats?.money_out || 0;
    },

    getRevenue: (equipment: EquipmentModel): number => {
        const moneyIn = EquipmentDataboard.getMoneyIn(equipment);
        const moneyOut = EquipmentDataboard.getMoneyOut(equipment);
        return moneyIn - moneyOut;
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
};
