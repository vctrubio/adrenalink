/**
 * Timezone utility functions for handling date/time operations
 * Assumes all timestamps in database are TIMESTAMPTZ (with timezone)
 */

/**
 * Parse date string to full timestamp
 * Handles both date-only (YYYY-MM-DD) and full ISO strings
 * Ensures timezone support for database insertion
 *
 * @param dateStr Date string (YYYY-MM-DD or ISO format)
 * @returns Date object with full timestamp
 * @example
 * parseDate("2025-11-14") → 2025-11-14T00:00:00.000Z
 * parseDate("2025-11-14T14:30:00") → 2025-11-14T14:30:00.000Z
 */
export function parseDate(dateStr: string): Date {
    // If it's just a date (YYYY-MM-DD), add 00:00:00
    if (dateStr.length === 10 && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(`${dateStr}T00:00:00`);
    }
    // Otherwise parse as full ISO string
    return new Date(dateStr);
}

/**
 * Convert ISO string to formatted time (HH:mm)
 * @param isoDate ISO date string
 * @returns Formatted time string (e.g., "14:30")
 */
export function getTimeFromISO(isoDate: string): string {
    try {
        const date = new Date(isoDate);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    } catch {
        return "Invalid time";
    }
}

/**
 * Convert ISO string to formatted date (MM/DD/YYYY)
 * @param isoDate ISO date string
 * @returns Formatted date string (e.g., "11/14/2025")
 */
export function getDateFromISO(isoDate: string): string {
    try {
        const date = new Date(isoDate);
        return date.toLocaleDateString("en-US");
    } catch {
        return "Invalid date";
    }
}

/**
 * Convert ISO string to formatted date and time
 * @param isoDate ISO date string
 * @returns Formatted datetime string (e.g., "11/14/2025, 14:30")
 */
export function getDateTimeFromISO(isoDate: string): string {
    try {
        const date = new Date(isoDate);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    } catch {
        return "Invalid datetime";
    }
}

/**
 * Get timezone offset string from ISO date (e.g., "+05:30", "-08:00")
 * @param isoDate ISO date string
 * @returns Timezone offset string
 */
export function getTimezoneOffset(isoDate: string): string {
    try {
        const date = new Date(isoDate);
        const offset = date.getTimezoneOffset();
        const hours = Math.floor(Math.abs(offset) / 60)
            .toString()
            .padStart(2, "0");
        const minutes = (Math.abs(offset) % 60).toString().padStart(2, "0");
        const sign = offset > 0 ? "-" : "+";
        return `${sign}${hours}:${minutes}`;
    } catch {
        return "+00:00";
    }
}
