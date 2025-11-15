/**
 * TeacherQueue-specific helper functions
 * All time manipulation and ISO parsing for queue event management
 */

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
