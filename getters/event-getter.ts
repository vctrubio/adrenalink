/**
 * Event getter functions for classboard events
 * Pure functions for event formatting and display calculations
 * Note: Queue state and gap detection moved to queue-getter.ts
 */

import type { EventNode } from "@/backend/classboard/TeacherQueue";
import type { EventData, LessonEventRowData } from "@/types/booking-lesson-event";
import { getMinutesFromISO, minutesToTime, getTimeFromISO } from "./queue-getter";
import { getPrettyDuration } from "./duration-getter";

/**
 * Transform raw event data to display row format
 */
export function transformEventToRow(event: EventData): LessonEventRowData {
    const eventDate = new Date(event.date);
    return {
        eventId: event.id,
        date: eventDate,
        time: getTimeFromISO(event.date),
        dateLabel: eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        dayOfWeek: eventDate.toLocaleDateString("en-US", { weekday: "short" }),
        duration: event.duration,
        durationLabel: getPrettyDuration(event.duration),
        location: event.location || "-",
        status: event.status,
    };
}

/**
 * Transform multiple events to display rows and sort by date
 */
export function transformEventsToRows(events: EventData[]): LessonEventRowData[] {
    return events.map(transformEventToRow).sort((a, b) => a.date.getTime() - b.date.getTime());
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
 * Get event confirmation status
 *
 * @param event - Event node
 * @returns 'pending' if event is planned/tbc, 'completed' if event is completed
 */
export function getEventConfirmationStatus(event: EventNode): "pending" | "completed" {
    return event.eventData.status === "completed" ? "completed" : "pending";
}
