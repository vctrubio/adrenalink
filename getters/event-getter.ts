/**
 * Event getter functions for classboard events
 * Pure functions for event formatting and display calculations
 * Note: Queue state and gap detection moved to queue-getter.ts
 */

import type { EventNode } from "@/backend/TeacherQueue";
import { getMinutesFromISO, minutesToTime } from "./queue-getter";

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
