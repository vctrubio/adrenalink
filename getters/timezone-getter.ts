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
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    const hour = parts.find((p) => p.type === "hour")?.value;
    const minute = parts.find((p) => p.type === "minute")?.value;
    const second = parts.find((p) => p.type === "second")?.value;

    const localDateString = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
    return new Date(localDateString);
}

/**
 * Converts a School's Wall Clock Time string to a UTC Date object.
 * Used when SAVING data from user input to the DB.
 *
 * Strategy:
 * 1. Assume the dateString is UTC to get the components.
 * 2. Format that "UTC" date into the Target Timezone to see the offset.
 * 3. Adjust the original time by that offset to get the real UTC.
 *
 * Example: User inputs "09:00" (Wall Time). School is UTC+8.
 * Result should be 01:00 UTC.
 */
export function convertSchoolTimeToUTC(dateString: string, schoolTimezone: string): Date {
    // 1. Parse the input string (e.g., "2025-10-27T09:00:00")
    // We explicitly avoid using new Date(dateString) directly to avoid browser timezone interference
    const [datePart, timePart] = dateString.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    // 2. Create a candidate UTC date.
    // If the user said 09:00, we create a 09:00 UTC date temporarily.
    // This allows us to use Intl to see what 09:00 UTC *would be* in the school's timezone.
    const candidateUTC = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

    // 3. Format this candidate to the school's timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: schoolTimezone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hourCycle: "h23",
        timeZoneName: "short",
    });

    const parts = formatter.formatToParts(candidateUTC);

    // Extract the "Local" time that 09:00 UTC represents in the school timezone
    const getPart = (type: string) => parseInt(parts.find((p) => p.type === type)?.value || "0");

    const localYear = getPart("year");
    const localMonth = getPart("month");
    const localDay = getPart("day");
    const localHour = getPart("hour");
    const localMinute = getPart("minute");

    // 4. Calculate the offset difference in minutes
    // We compare the Candidate (UTC) components vs. the Formatted (Local) components
    const utcTimeValue = candidateUTC.getTime();

    // Construct a date object from the "Local" components, treating them as UTC for math purposes
    const localTimeValue = Date.UTC(localYear, localMonth - 1, localDay, localHour, localMinute, 0);

    // The difference is the offset (e.g., if School is UTC+8, localTimeValue will be 8 hours ahead of utcTimeValue)
    const offsetMs = localTimeValue - utcTimeValue;

    // 5. Apply the offset in reverse to get the true UTC time
    // We want the result where (Result + Offset) = Wall Clock Time
    // So: Result = Wall Clock Time - Offset
    // Since 'candidateUTC' *is* the Wall Clock Time value placed in a UTC container:
    return new Date(utcTimeValue - offsetMs);
}
