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

// ============ DURATION FULL FORMAT ============
// Converts minutes to H:MM format (e.g., "11:30") without suffix
export function getFullDuration(durationMinutes: number): string {
    const totalMinutes = Math.round(durationMinutes);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

// ============ DURATION HM FORMAT ============
// Converts minutes to compact format (e.g., "4h", "4h30m", "30m")
// Set withUnits to false to return without unit suffix (e.g., "4", "4:30", "30")
export function getHMDuration(durationMinutes: number, withUnits = true): string {
    const totalMinutes = Math.round(durationMinutes);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (totalMinutes === 0) {
        return "0";
    }

    if (!withUnits) {
        if (hours === 0) {
            return `${minutes}`;
        }

        if (minutes === 0) {
            return `${hours}`;
        }

        return `${hours}:${minutes.toString().padStart(2, "0")}`;
    }

    if (hours === 0) {
        return `${minutes}m`;
    }

    if (minutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h${minutes}m`;
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

export function getDurationHours(minutes: number): number {
    return Math.round(minutes / 60);
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
