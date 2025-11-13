/**
 * Date utilities for formatting, manipulation, and validation
 * Handles all date-related operations except timezone logic
 */

// ============ DATE STRING FORMATTERS ============

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as ISO string (with time set to noon UTC)
 */
export function getTodayISO(): string {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T12:00:00.000Z`;
}

/**
 * Get tomorrow's date as ISO string (with time set to noon UTC)
 */
export function getTomorrowISO(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T12:00:00.000Z`;
}

/**
 * Format date as ISO string (YYYY-MM-DD) for input[type="date"]
 */
export function formatDateForInput(date: Date | string): string {
  if (!date) return "";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

/**
 * Convert a date to ISO string with time set to noon UTC
 */
export function toISOString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T12:00:00.000Z`;
}

/**
 * Format date to ISO string with custom time
 */
export function formatDateToISO(date: Date, time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const dateStr = date.toISOString().split("T")[0];
  return `${dateStr}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
}

/**
 * Format date for display (e.g., "Nov 13")
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ============ DATE MANIPULATION ============

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate days between two dates (absolute value)
 */
export function calculateDaysDifference(dateStart: string | Date, dateEnd: string | Date): number {
  const start = new Date(dateStart);
  const end = new Date(dateEnd);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate days between two dates (inclusive)
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// ============ DATE VALIDATION ============

/**
 * Check if a date is before today
 */
export function isBeforeToday(dateString: string): boolean {
  if (!dateString) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(dateString.split("T")[0]);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

/**
 * Check if a date is within a date range
 */
export function isDateInRange(dateStr: string, startDate: string, endDate: string): boolean {
  const date = new Date(dateStr);
  const start = new Date(startDate);
  const end = new Date(endDate);
  date.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return date >= start && date <= end;
}

// ============ RELATIVE DATE LABELS ============

/**
 * Get relative date label (Today, Tomorrow, In X days, etc.)
 */
export function getRelativeDateLabel(dateString: string): string {
  if (!dateString) return "";

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const targetDate = new Date(dateString.split("T")[0]);
  targetDate.setHours(12, 0, 0, 0);

  const todayDateString = today.toDateString();
  const targetDateString = targetDate.toDateString();

  if (todayDateString === targetDateString) return "Today";

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1) return `In ${diffDays} days`;
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  return "";
}

// ============ TIME UTILITIES ============

/**
 * Convert time string (HH:MM) to minutes
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Add minutes to a time string (HH:MM)
 */
export function addMinutesToTime(time: string, minutesToAdd: number): string {
  const totalMinutes = timeToMinutes(time) + minutesToAdd;
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  return minutesToTime(normalizedMinutes);
}

/**
 * Extract time (HH:MM) from ISO string
 */
export function getTimeFromISO(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Format a date span as "Month DD +X days"
 * Example: "Nov 13 +3" for November 13 with 3 additional days
 */
export function prettyDateSpan(dateStart: string | Date, dateEnd: string | Date): string {
  const start = new Date(dateStart);
  const end = new Date(dateEnd);

  // Get the start date in "Mon DD" format
  const startFormatted = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  // Calculate the number of days (inclusive)
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return `${startFormatted} +${diffDays}`;
}
