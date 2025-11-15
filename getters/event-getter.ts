/**
 * Event getter functions for classboard events
 * Pure functions for event calculations and transformations
 */

import type { EventNode, TeacherQueue } from "@/backend/TeacherQueue";
import { getMinutesFromISO, minutesToTime } from "./queue-getter";

/**
 * Detect gap before an event in the queue
 * FIXED: Now uses getMinutesFromISO() instead of timeToMinutes() for ISO strings
 *
 * @param currentEvent - The event to check for gap before
 * @param events - All events in the queue
 * @param index - Index of current event in the queue
 * @param requiredGapMinutes - Minimum gap required between events
 * @returns Gap information { hasGap, gapDuration, meetsRequirement }
 */
export function detectGapBefore(
    currentEvent: EventNode,
    events: EventNode[],
    index: number,
    requiredGapMinutes: number
): { hasGap: boolean; gapDuration: number; meetsRequirement: boolean } {
    if (index === 0) return { hasGap: false, gapDuration: 0, meetsRequirement: true };

    const previousEvent = events[index - 1];
    const previousEndTime = getMinutesFromISO(previousEvent.eventData.date) + previousEvent.eventData.duration;
    const currentStartTime = getMinutesFromISO(currentEvent.eventData.date);
    const gapMinutes = currentStartTime - previousEndTime;

    return {
        hasGap: gapMinutes > 0,
        gapDuration: Math.max(0, gapMinutes),
        meetsRequirement: gapMinutes >= requiredGapMinutes,
    };
}

/**
 * Get event end time as HH:MM string
 *
 * @param event - Event node
 * @returns End time in HH:MM format (e.g., "13:00")
 */
export function getEventEndTime(event: EventNode): string {
    const startMinutes = getMinutesFromISO(event.eventData.date);
    const endMinutes = startMinutes + event.eventData.duration;
    return minutesToTime(endMinutes);
}

/**
 * Get event time range as string
 *
 * @param event - Event node
 * @returns Time range (e.g., "11:30 - 13:00")
 */
export function getEventTimeRange(event: EventNode): string {
    const startTime = getMinutesFromISO(event.eventData.date);
    const endTime = getEventEndTime(event);
    return `${minutesToTime(startTime)} - ${endTime}`;
}

/**
 * Get all props needed for EventModCard
 * Consolidates prop computation to reduce prop drilling
 *
 * @param event - Event node
 * @param events - All events in the queue
 * @param index - Index of event in queue
 * @param teacherQueue - Teacher queue instance
 * @param requiredGapMinutes - Minimum gap required
 * @returns Object with all EventModCard props
 */
export function getEventCardProps(
    event: EventNode,
    events: EventNode[],
    index: number,
    teacherQueue: TeacherQueue,
    requiredGapMinutes: number
) {
    const gap = detectGapBefore(event, events, index, requiredGapMinutes);
    const isFirst = index === 0;
    const isLast = index === events.length - 1;
    const canMoveEarlier = teacherQueue.canMoveEarlier(event.lessonId);
    const canMoveLater = teacherQueue.canMoveLater(event.lessonId);

    return {
        gap,
        isFirst,
        isLast,
        canMoveEarlier,
        canMoveLater,
    };
}
