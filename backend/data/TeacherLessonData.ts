import { getHMDuration } from "@/getters/duration-getter";
import { transformEventsToRows } from "@/getters/event-getter";
import { calculateLessonRevenue, calculateCommission } from "@/getters/commission-calculator";
import type { EventData } from "@/types/booking-lesson-event";
import type { TimelineEvent } from "@/src/components/timeline";

export interface LessonRow {
    lessonId: string;
    bookingId: string;
    leaderName: string;
    dateStart: string;
    dateEnd: string;
    lessonStatus: string;
    bookingStatus: string;
    commissionType: string;
    cph: number;
    totalDuration: number;
    totalHours: number;
    totalEarning: number;
    eventCount: number;
    events: any[];
    equipmentCategory: string;
    studentCapacity: number;
}

/**
 * Process teacher lessons data and build lesson rows + timeline events
 * Centralizes all lesson data transformation logic for consistency
 */
export function buildTeacherLessonData(
    lessons: any[],
    teacher: { id: string; first_name?: string; username: string },
): {
    lessonRows: LessonRow[];
    timelineEvents: TimelineEvent[];
} {
    const lessonRows: LessonRow[] = [];
    const timelineEvents: TimelineEvent[] = [];

    for (const lesson of lessons) {
        // Use standardized snake_case properties
        const events = (lesson.event || []) as EventData[];
        const booking = lesson.booking;
        const commission = lesson.teacher_commission;
        const school_package = booking?.school_package;

        const totalDuration = events.reduce((sum: number, e: any) => sum + (e.duration || 0), 0);
        const totalHours = totalDuration / 60;
        const cph = parseFloat(commission?.cph || "0");
        const commissionType = (commission?.commission_type as "fixed" | "percentage") || "fixed";

        const eventRows = transformEventsToRows(events as any);
        let totalEarning = 0;

        for (const eventRow of eventRows) {
            // Calculate revenues
            const studentCount = school_package?.capacity_students || 1;
            const pricePerStudent = school_package?.price_per_student || 0;
            const packageDurationMinutes = school_package?.duration_minutes || 60;

            const eventRevenue = calculateLessonRevenue(
                pricePerStudent,
                studentCount,
                eventRow.duration,
                packageDurationMinutes,
            );
            const eventCommission = calculateCommission(
                eventRow.duration,
                { type: commissionType, cph },
                eventRevenue,
                packageDurationMinutes,
            );
            const eventEarning = eventCommission.earned;

            totalEarning += eventEarning;
            const schoolRevenue = eventRevenue - eventEarning;

            // Override duration label for consistency
            eventRow.durationLabel = getHMDuration(eventRow.duration);

            // Build timeline event
            timelineEvents.push({
                eventId: eventRow.eventId,
                lessonId: lesson.id,
                date: eventRow.date,
                time: eventRow.time,
                dateLabel: eventRow.dateLabel,
                dayOfWeek: eventRow.dayOfWeek || "",
                duration: eventRow.duration,
                durationLabel: eventRow.durationLabel,
                location: eventRow.location,
                teacherId: teacher.id,
                teacherName: teacher.first_name || "Unknown",
                teacherUsername: teacher.username,
                eventStatus: eventRow.status,
                lessonStatus: lesson.status,
                teacherEarning: eventEarning,
                schoolRevenue,
                totalRevenue: eventRevenue,
                commissionType,
                commissionCph: cph,
                bookingStudents: [],
                equipmentCategory: school_package?.category_equipment,
                capacityEquipment: school_package?.capacity_equipment,
                capacityStudents: school_package?.capacity_students,
            });
        }

        lessonRows.push({
            lessonId: lesson.id,
            bookingId: booking?.id || "",
            leaderName: booking?.leader_student_name || "Unknown",
            dateStart: booking?.date_start || "",
            dateEnd: booking?.date_end || "",
            lessonStatus: lesson.status,
            bookingStatus: booking!.status,
            commissionType,
            cph,
            totalDuration,
            totalHours,
            totalEarning,
            eventCount: events.length,
            events: eventRows,
            equipmentCategory: school_package?.category_equipment!,
            studentCapacity: school_package?.capacity_students!,
        });
    }

    timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    return { lessonRows, timelineEvents };
}
