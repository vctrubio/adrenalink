/**
 * Commission Calculator - Reusable logic for calculating teacher earnings
 * Handles both FIXED and PERCENTAGE commission types
 * Used by TeacherQueue, ClassboardStats, and TLETab
 */

export interface CommissionInfo {
    type: "fixed" | "percentage";
    cph: number; // Commission per hour (fixed) or percentage rate (percentage)
}

export interface CommissionCalculation {
    type: "fixed" | "percentage";
    commissionRate: string; // Display: "25%" or "Fixed Rate"
    pricePerHour: string; // Display: "$60.00/hr"
    hours: string; // Display: "1:30 hrs"
    earned: number; // Raw calculation
    earnedDisplay: string; // Display: "$22.50"
}

/**
 * Calculate teacher earnings from events based on commission type
 * - FIXED: commission.cph × totalHours = earnings
 * - PERCENTAGE: (commission.cph / 100) × lessonRevenue = earnings
 *
 * @param durationMinutes - Total event duration in minutes
 * @param commission - Commission info (type and rate)
 * @param lessonRevenue - Total lesson revenue (required for percentage type)
 * @param packageDurationMinutes - Total package duration (for calculating hourly rates)
 * @returns Calculated earnings and formatted display values
 */
export function calculateCommission(
    durationMinutes: number,
    commission: CommissionInfo,
    lessonRevenue = 0,
    packageDurationMinutes = 0
): CommissionCalculation {
    const totalHours = durationMinutes / 60;
    const hours = formatDuration(durationMinutes);
    const cph = typeof commission.cph === 'string' ? parseFloat(commission.cph) : commission.cph;

    if (commission.type === "fixed") {
        // FIXED: rate/hr × hours = earnings
        const earned = cph * totalHours;
        return {
            type: "fixed",
            commissionRate: `$${cph.toFixed(2)}/hr`,
            pricePerHour: `$${cph.toFixed(2)}/hr`,
            hours,
            earned,
            earnedDisplay: `$${earned.toFixed(2)}`,
        };
    } else {
        // PERCENTAGE: rate% × lessonRevenue = earnings
        const earned = (cph / 100) * lessonRevenue;
        const packageHours = packageDurationMinutes > 0 ? packageDurationMinutes / 60 : 1;
        const pricePerHourValue = lessonRevenue / (durationMinutes / 60); // Revenue per hour for this specific lesson

        return {
            type: "percentage",
            commissionRate: `${cph.toFixed(2)}%`,
            pricePerHour: `$${pricePerHourValue.toFixed(2)}/hr`, // Effective revenue per hour
            hours,
            earned,
            earnedDisplay: `$${earned.toFixed(2)}`,
        };
    }
}

/**
 * Format duration in minutes to readable string (e.g., "1:30 hrs" or "45 mins")
 */
function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
        return `${hours}:00 hrs`;
    }
    return `${hours}:${mins.toString().padStart(2, "0")} hrs`;
}

/**
 * Calculate school revenue from lesson
 * Formula: (pricePerStudent / packageDurationMinutes) × eventDurationMinutes × studentCount
 *
 * This calculates the revenue portion for a specific event based on:
 * - The package's price per student
 * - How long the event actually is (vs the total package duration)
 * - How many students are in the event
 *
 * @param pricePerStudent - Package price per student (total for full package duration)
 * @param studentCount - Number of students in this event
 * @param eventDurationMinutes - Actual event duration
 * @param packageDurationMinutes - Total package duration (used to calculate rate per minute)
 * @returns Revenue for this event portion
 */
export function calculateLessonRevenue(
    pricePerStudent: number,
    studentCount: number,
    eventDurationMinutes: number,
    packageDurationMinutes: number
): number {
    // Avoid division by zero
    if (packageDurationMinutes === 0) return 0;

    // Calculate price per minute, then multiply by event duration and student count
    const pricePerMinute = pricePerStudent / packageDurationMinutes;
    return pricePerMinute * eventDurationMinutes * studentCount;
}

/**
 * Calculate school profit from an event
 * Formula: lessonRevenue - teacherEarnings
 *
 * @param lessonRevenue - Total lesson revenue
 * @param teacherEarnings - Teacher's commission from this lesson
 * @returns School profit (non-negative)
 */
export function calculateSchoolProfit(lessonRevenue: number, teacherEarnings: number): number {
    return Math.max(0, lessonRevenue - teacherEarnings);
}
