import type { TimelineEvent } from "@/src/components/timeline";
import type { TransactionEventData } from "@/types/transaction-event";
import { buildTransactionEvents, groupEventsByLesson, transactionEventToTimelineEvent, type LessonGroup } from "@/getters/teacher-lesson-getter";

/**
 * Legacy LessonRow interface for backward compatibility
 */
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
    commissionDescription?: string | null;
    totalDuration: number;
    totalHours: number;
    totalEarning: number;
    totalRevenue?: number;
    totalPayments?: number;
    eventCount: number;
    events: TimelineEvent[];
    equipmentCategory: string;
    studentCapacity: number;
}

/**
 * Process teacher lessons data and build lesson rows + timeline events
 * Uses TransactionEventData as single source of truth
 *
 * @param lessons - Array of lesson objects with event, booking, teacher_commission
 * @param teacher - Teacher info (optional, will use lesson.teacher if available)
 */
export function buildTeacherLessonData(
    lessons: any[],
    teacher?: { id: string; first_name?: string; username: string },
): {
    lessonRows: LessonRow[];
    timelineEvents: TimelineEvent[];
} {
    // Build flat list of transaction events (single source of truth)
    const transactionEvents = buildTransactionEvents(lessons, teacher);

    // Group events by lesson
    const lessonGroups = groupEventsByLesson(transactionEvents);

    // Convert to legacy LessonRow format for backward compatibility
    const lessonRows: LessonRow[] = lessonGroups.map((group) => ({
        lessonId: group.lessonId,
        bookingId: group.bookingId,
        leaderName: group.leaderName,
        dateStart: group.dateStart,
        dateEnd: group.dateEnd,
        lessonStatus: group.lessonStatus,
        bookingStatus: group.bookingStatus,
        commissionType: group.commissionType,
        cph: group.cph,
        commissionDescription: group.commissionDescription,
        totalDuration: group.totalDuration,
        totalHours: group.totalHours,
        totalEarning: group.totalEarning,
        eventCount: group.eventCount,
        events: group.events,
        equipmentCategory: group.equipmentCategory,
        studentCapacity: group.studentCapacity,
    }));

    // Convert to timeline events
    const timelineEvents: TimelineEvent[] = transactionEvents.map(transactionEventToTimelineEvent);
    timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    return { lessonRows, timelineEvents };
}
