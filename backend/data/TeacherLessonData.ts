import type { TimelineEvent } from "@/src/components/timeline";
import { buildEventModels, groupEventsByLesson, eventModelToTimelineEvent, type EventModel, type LessonGroup } from "./EventModel";

/**
 * @deprecated Use EventModel and LessonGroup from EventModel.ts instead
 * This is kept for backward compatibility
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
    totalDuration: number;
    totalHours: number;
    totalEarning: number;
    eventCount: number;
    events: EventModel[];
    equipmentCategory: string;
    studentCapacity: number;
}

/**
 * Process teacher lessons data and build lesson rows + timeline events
 * Uses centralized EventModel as single source of truth
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
    // Build flat list of events (single source of truth)
    const eventModels = buildEventModels(lessons, teacher);
    
    // Group events by lesson
    const lessonGroups = groupEventsByLesson(eventModels);
    
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
        totalDuration: group.totalDuration,
        totalHours: group.totalHours,
        totalEarning: group.totalEarning,
        eventCount: group.eventCount,
        events: group.events,
        equipmentCategory: group.equipmentCategory,
        studentCapacity: group.studentCapacity,
    }));
    
    // Convert to timeline events
    const timelineEvents: TimelineEvent[] = eventModels.map(eventModelToTimelineEvent);
    timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    return { lessonRows, timelineEvents };
}

/**
 * @deprecated Use filterEvents and sortEvents from EventModel.ts instead
 * This function is no longer used and kept only for reference
 */
