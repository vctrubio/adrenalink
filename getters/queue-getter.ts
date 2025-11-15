/**
 * TeacherQueue-specific helper functions
 * All time manipulation and ISO parsing for queue event management
 */

import type { EventNode, TeacherQueue } from "@/backend/TeacherQueue";

export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function getTimeFromISO(isoString: string): string {
    const match = isoString.match(/T(\d{2}):(\d{2})/);
    if (match) {
        return `${match[1]}:${match[2]}`;
    }
    return "00:00";
}

export function getMinutesFromISO(isoString: string): number {
    const time = getTimeFromISO(isoString);
    return timeToMinutes(time);
}

export function adjustISODateTime(isoString: string, changeMinutes: number): string {
    const currentMinutes = getMinutesFromISO(isoString);
    const newMinutes = currentMinutes + changeMinutes;
    const newTime = minutesToTime(newMinutes);
    const datePart = isoString.split("T")[0];
    return `${datePart}T${newTime}:00`;
}

export function createISODateTime(dateString: string, time: string): string {
    return `${dateString}T${time}:00`;
}

export function addMinutesToTime(time: string, minutesToAdd: number): string {
    const totalMinutes = timeToMinutes(time) + minutesToAdd;
    const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
    return minutesToTime(normalizedMinutes);
}

/**
 * Detect gap before an event in the queue
 * Uses getMinutesFromISO() for ISO string parsing
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

