import type { TeacherModel } from "@/backend/models";
import { getPrettyDuration } from "@/getters/duration-getter";
import { prettyDateSpan } from "@/getters/date-getter";
import { calculateCommission, calculateLessonRevenue, type CommissionInfo } from "@/getters/commission-calculator";

export interface TeacherLessonStatsData {
    lessonId: string;
    bookingId: string | null;
    bookingStatus: string | null;
    dateRange: string;
    packageDescription: string;
    eventsCount: number;
    durationHours: number;
    moneyToPay: number;
    moneyPaid: number;
    balance: number;
    formula: string;
}

export function getTeacherLessonStats(teacher: TeacherModel): TeacherLessonStatsData[] {
    if (!teacher.relations?.lessons) {
        return [];
    }

    const lessonStats = teacher.relations.lessons.map((lesson) => {
        const events = lesson.events || [];
        const booking = lesson.booking;
        const schoolPackage = booking?.studentPackage?.schoolPackage;
        const studentCount = booking?.bookingStudents?.length || 0;

        const commissionModel = teacher.relations?.commissions?.find((c) => c.id === lesson.commissionId);

        const durationMinutes = events.reduce((acc, event) => acc + (event.duration || 0), 0);
        const durationHours = durationMinutes / 60;

        let moneyToPay = 0;
        let formula = "No commission data";

        if (commissionModel && schoolPackage) {
            const lessonRevenue = calculateLessonRevenue(
                schoolPackage.pricePerStudent,
                studentCount,
                durationMinutes,
                schoolPackage.durationMinutes,
            );

            const commissionInfo: CommissionInfo = {
                type: commissionModel.commissionType,
                cph: commissionModel.cph,
            };

            const calculation = calculateCommission(durationMinutes, commissionInfo, lessonRevenue, schoolPackage.durationMinutes);

            moneyToPay = calculation.earned;
            formula = `${calculation.commissionRate} × ${calculation.hours} = ${calculation.earnedDisplay}`;
        }

        // NOTE: moneyPaid logic will depend on how payments are associated with lessons.
        // This is a placeholder.
        const moneyPaid = 0;
        const balance = moneyToPay - moneyPaid;

        return {
            lessonId: lesson.id,
            bookingId: booking?.id || null,
            bookingStatus: booking?.status || "Unknown",
            dateRange: booking ? prettyDateSpan(booking.dateStart, booking.dateEnd) : "N/A",
            packageDescription: schoolPackage?.description || "N/A",
            eventsCount: events.length,
            durationHours: durationHours,
            moneyToPay: moneyToPay,
            moneyPaid: moneyPaid,
            balance: balance,
            formula: formula,
        };
    });

    return lessonStats;
}
