

import type { TeacherModel } from "@/backend/models";
import { getPrettyDuration } from "@/getters/duration-getter";
import { prettyDateSpan } from "@/getters/date-getter";
import { getTeacherLessonCommission } from "@/getters/teacher-commission-getter";
import type { TeacherCommissionType } from "@/drizzle/schema";

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

// Minimal type definition based on what getTeacherLessonCommission expects
interface CommissionData {
    type: "fixed" | "percentage";
    cph: number | string;
}

export function getTeacherLessonStats(teacher: TeacherModel): TeacherLessonStatsData[] {
    if (!teacher.relations?.lessons) {
        return [];
    }

    const lessonStats = teacher.relations.lessons.map((lesson) => {
        const events = lesson.events || [];
        const booking = lesson.booking;
        const schoolPackage = booking?.studentPackage?.schoolPackage;
        
        const commissionModel = teacher.relations?.commissions?.find(c => c.id === lesson.commissionId);
        
        // Adapt TeacherCommissionType to the expected CommissionData interface
        const commissionForCalc: CommissionData | undefined = commissionModel ? {
            type: commissionModel.commissionType,
            cph: commissionModel.cph,
        } : undefined;

        const commissionResult = getTeacherLessonCommission(
            events,
            commissionForCalc,
            schoolPackage?.pricePerStudent,
            schoolPackage?.durationMinutes
        );

        const durationMinutes = events.reduce((acc, event) => acc + (event.duration || 0), 0);
        const durationHours = durationMinutes / 60;
        
        // NOTE: moneyPaid logic will depend on how payments are associated with lessons.
        // This is a placeholder.
        const moneyPaid = 0;
        const moneyToPay = commissionResult.total;
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
            formula: commissionResult.formula,
        };
    });

    return lessonStats;
}
