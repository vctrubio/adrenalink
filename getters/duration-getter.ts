// ============ DURATION FORMATTING ============
// Converts minutes to human-readable format (e.g., "1:30 hrs", "55 mins")
// Never shows float numbers, always uses H:MM format

export function getPrettyDuration(durationMinutes: number): string {
    const totalMinutes = Math.round(durationMinutes);

    if (totalMinutes === 0) {
        return "0 mins";
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
        return `${minutes} mins`;
    }

    return `${hours}:${minutes.toString().padStart(2, "0")} hrs`;
}

// ============ DURATION CONSTANTS ============
export const MIN_DURATION = 60;
export const MAX_DURATION = 360;

export const DEFAULT_DURATION_CAP_ONE = 120;
export const DEFAULT_DURATION_CAP_TWO = 180;
export const DEFAULT_DURATION_CAP_THREE = 240;

// ============ DURATION UTILITIES ============
export function minutesToHours(minutes: number): number {
    return Math.round((minutes / 60) * 10) / 10;
}

export function hoursToMinutes(hours: number): number {
    return Math.round(hours * 60);
}

export function adjustDuration(currentDuration: number, increment: number): number {
    return Math.max(MIN_DURATION, Math.min(MAX_DURATION, currentDuration + increment));
}

export function getDurationByStudentCount(studentCount: number, capOne: number, capTwo: number, capThree: number): number {
    if (studentCount === 1) return capOne;
    if (studentCount === 2) return capTwo;
    return capThree;
}
