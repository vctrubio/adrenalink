/**
 * General date utilities for formatting, manipulation, and validation
 * Queue-specific time functions are in queue-getter.ts
 * Timezone conversions are in timezone-getter.ts
 */

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayISO(): string {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T12:00:00.000Z`;
}

export function getTomorrowISO(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T12:00:00.000Z`;
}

export function formatDateForInput(date: Date | string): string {
  if (!date) return "";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

export function toISOString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T12:00:00.000Z`;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function calculateDaysDifference(dateStart: string | Date, dateEnd: string | Date): number {
  const start = new Date(dateStart);
  const end = new Date(dateEnd);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function daysBetween(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function isBeforeToday(dateString: string): boolean {
  if (!dateString) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(dateString.split("T")[0]);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
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

export function prettyDateSpan(dateStart: string | Date, dateEnd: string | Date): string {
  const start = new Date(dateStart);
  const end = new Date(dateEnd);

  const startFormatted = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return `${startFormatted} +${diffDays}`;
}
