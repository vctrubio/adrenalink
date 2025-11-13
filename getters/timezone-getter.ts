/**
 * Timezone utilities for handling timezone conversions and lookups
 * All date formatting logic should be in date-getter.ts
 */

/**
 * Get timezone from latitude and longitude coordinates
 * Returns timezone string or null if coordinates are invalid
 */
export function getTimeZoneLatLong(latitude?: number, longitude?: number): string | null {
    if (!latitude || !longitude) {
        return null;
    }

    // Basic timezone estimation based on longitude
    // Each timezone is roughly 15 degrees wide (360° / 24 hours)
    const timezoneOffset = Math.round(longitude / 15);
    
    // Common timezone mappings based on coordinates
    const timezoneMap: Record<string, string> = {
        // Americas
        "-8": "America/Los_Angeles",
        "-7": "America/Denver", 
        "-6": "America/Chicago",
        "-5": "America/New_York",
        "-4": "America/Santiago",
        "-3": "America/Sao_Paulo",
        
        // Europe/Africa
        "0": "Europe/London",
        "1": "Europe/Paris",
        "2": "Europe/Berlin",
        "3": "Europe/Moscow",
        
        // Asia/Pacific
        "4": "Asia/Dubai",
        "5": "Asia/Karachi",
        "6": "Asia/Dhaka",
        "7": "Asia/Bangkok",
        "8": "Asia/Shanghai",
        "9": "Asia/Tokyo",
        "10": "Australia/Sydney",
        "11": "Pacific/Norfolk",
        "12": "Pacific/Auckland",
        
        // Negative offsets
        "-9": "America/Anchorage",
        "-10": "Pacific/Honolulu",
        "-11": "Pacific/Midway",
        "-12": "Pacific/Baker_Island"
    };

    const timezone = timezoneMap[timezoneOffset.toString()];
    
    // Fallback to UTC offset format if no specific timezone found
    if (!timezone) {
        const sign = timezoneOffset >= 0 ? "+" : "";
        return `UTC${sign}${timezoneOffset}`;
    }
    
    return timezone;
}

/**
 * Get timezone abbreviation from coordinates
 * Returns timezone abbreviation string or null if coordinates are invalid
 */
export function getTimezoneAbbreviation(latitude?: number, longitude?: number): string | null {
    if (!latitude || !longitude) {
        return null;
    }

    const timezoneOffset = Math.round(longitude / 15);

    const abbreviationMap: Record<string, string> = {
        "-8": "PST",
        "-7": "MST",
        "-6": "CST",
        "-5": "EST",
        "-4": "AST",
        "-3": "BRT",
        "0": "GMT",
        "1": "CET",
        "2": "EET",
        "3": "MSK",
        "4": "GST",
        "5": "PKT",
        "6": "BST",
        "7": "ICT",
        "8": "CST",
        "9": "JST",
        "10": "AEST",
        "11": "NFT",
        "12": "NZST"
    };

    return abbreviationMap[timezoneOffset.toString()] || `UTC${timezoneOffset >= 0 ? "+" : ""}${timezoneOffset}`;
}

// ============ TIME UTILITIES ============
export function getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function addMinutesToTime(time: string, minutesToAdd: number): string {
    const totalMinutes = timeToMinutes(time) + minutesToAdd;
    const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
    return minutesToTime(normalizedMinutes);
}

export function isDateInRange(dateStr: string, startDate: string, endDate: string): boolean {
    const date = new Date(dateStr);
    const start = new Date(startDate);
    const end = new Date(endDate);
    date.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
}

export function formatDateToISO(date: Date, time: string): string {
    const [hours, minutes] = time.split(":").map(Number);
    const dateStr = date.toISOString().split("T")[0];
    return `${dateStr}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
}

export function getTimeFromISO(isoString: string): string {
    const date = new Date(isoString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}