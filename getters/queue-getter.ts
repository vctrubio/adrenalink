/**
 * Queue Getter - Utilities for time manipulation and queue calculations
 */

export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function getMinutesFromISO(isoString: string): number {
    const time = getTimeFromISO(isoString);
    return timeToMinutes(time);
}

export function getTimeFromISO(isoString: string): string {
    if (!isoString) return "00:00";
    // Handle both '2024-01-01T10:00:00' and '2024-01-01 10:00:00'
    const parts = isoString.split(/[T ]/);
    const timePart = parts.length > 1 ? parts[1] : parts[0];
    return timePart.substring(0, 5);
}

export function getDatePartFromISO(isoString: string): string {
    if (!isoString) return "";
    return isoString.split(/[T ]/)[0];
}

export function createISODateTime(datePart: string, timePart: string): string {
    return `${datePart}T${timePart}:00`;
}

export function addMinutesToTime(time: string, minutesToAdd: number): string {
    const currentMinutes = timeToMinutes(time);
    const newMinutes = Math.max(0, Math.min(1439, currentMinutes + minutesToAdd)); // Clamp between 00:00 and 23:59
    return minutesToTime(newMinutes);
}

export function adjustISODateTime(isoString: string, changeMinutes: number): string {
    const datePart = getDatePartFromISO(isoString);
    const currentMinutes = getMinutesFromISO(isoString);
    const newMinutes = currentMinutes + changeMinutes;
    return createISODateTime(datePart, minutesToTime(newMinutes));
}

/**
 * Check if there is a gap before the event at the given index
 */
export function detectGapBefore(event: any, events: any[], index: number, requiredGap: number) {
    if (index === 0) {
        return { hasGap: false, gapDuration: 0, meetsRequirement: true };
    }

    const prevEvent = events[index - 1];
    const prevEnd = getMinutesFromISO(prevEvent.eventData.date) + prevEvent.eventData.duration;
    const currentStart = getMinutesFromISO(event.eventData.date);
    const gap = currentStart - prevEnd;

    return {
        hasGap: gap > 0,
        gapDuration: gap,
        meetsRequirement: gap >= requiredGap,
    };
}
