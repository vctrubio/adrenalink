/**
 * Duration utility functions for formatting and manipulating time durations
 */

export const DURATION_INCREMENT = 15; // minutes

/**
 * Convert minutes to a pretty formatted string
 * Examples: 30 -> "30 min", 90 -> "1h 30 min", 60 -> "1h"
 * @param minutes Duration in minutes
 * @returns Formatted duration string
 */
export function getPrettyDuration(minutes: number): string {
    if (minutes <= 0) return "0 min";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
        return `${mins} min`;
    }

    if (mins === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${mins} min`;
}

/**
 * Adjust a duration by the standard increment
 * @param duration Current duration in minutes
 * @param direction 1 for increase, -1 for decrease
 * @returns Adjusted duration (minimum 15 minutes)
 */
export function adjustDuration(duration: number, direction: 1 | -1): number {
    const newDuration = duration + DURATION_INCREMENT * direction;
    return Math.max(DURATION_INCREMENT, newDuration);
}

/**
 * Check if a duration is a valid multiple of the increment
 * @param minutes Duration in minutes
 * @returns True if duration is valid
 */
export function isValidDuration(minutes: number): boolean {
    return minutes > 0 && minutes % DURATION_INCREMENT === 0;
}

/**
 * Convert duration in minutes to hours as decimal
 * @param minutes Duration in minutes
 * @returns Duration in hours
 */
export function minutesToHours(minutes: number): number {
    return minutes / 60;
}

/**
 * Convert duration in hours to minutes
 * @param hours Duration in hours
 * @returns Duration in minutes
 */
export function hoursToMinutes(hours: number): number {
    return hours * 60;
}
