/**
 * Timezone conversion utilities for school timezone handling
 * All date/time utilities are in date-getter.ts
 */

/**
 * Converts a UTC Date object to the School's Wall Clock Time.
 * Returns a Date object that, when converted to ISO, represents the local time as if it were UTC.
 * 
 * Example: DB has 01:00 UTC. School is UTC+8. 
 * Returns a Date object that outputs "09:00:00.000Z" in toISOString().
 * This allows the client to treat the time parts as Absolute Truth.
 */
export function convertUTCToSchoolTimezone(utcDate: Date, schoolTimezone: string): Date {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: schoolTimezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
    });

    const parts = formatter.formatToParts(utcDate);
    const year = parts.find(p => p.type === "year")?.value;
    const month = parts.find(p => p.type === "month")?.value;
    const day = parts.find(p => p.type === "day")?.value;
    const hour = parts.find(p => p.type === "hour")?.value;
    const minute = parts.find(p => p.type === "minute")?.value;
    const second = parts.find(p => p.type === "second")?.value;

    // We append Z to the local time parts to "fake" it as UTC for the transport layer
    const localDateString = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
    return new Date(localDateString);
}