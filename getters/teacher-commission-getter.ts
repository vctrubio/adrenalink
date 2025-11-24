// ============ TEACHER LESSON COMMISSION CALCULATION ============
// Calculates how much a teacher earned from their lessons based on their commission rate

import { getPrettyDuration } from "./duration-getter";

interface CommissionData {
	type: "fixed" | "percentage";
	cph: number; // Commission per hour or percentage rate
}

interface TeacherCommissionResult {
	total: number;
	formula: string; // Math explanation for display
	commissionRate: string; // Commission rate (e.g., "25%")
	pricePerHour: string; // Price per hour (e.g., "$60.00")
	hours: string; // Total hours (e.g., "1:30 hrs")
	earned: string; // Total earned (e.g., "$22.50")
}

/**
 * Calculate total commission earned by a teacher from lessons
 * Formula: commission_rate × price_per_hour × total_hours = earnings
 *
 * @param events - Array of events with their durations in minutes
 * @param commission - Teacher's commission data (type and rate)
 * @param lessonRevenue - Total lesson revenue (for this teacher's portion)
 * @param packageDurationMinutes - Total package duration in minutes
 * @returns Object with total earned amount and breakdown components
 */
export function getTeacherLessonCommission(
	events: Array<{ duration: number }>,
	commission?: CommissionData,
	lessonRevenue?: number,
	packageDurationMinutes?: number
): TeacherCommissionResult {
	if (!commission || events.length === 0) {
		return {
			total: 0,
			formula: "No commission data",
			commissionRate: "0%",
			pricePerHour: "$0.00",
			hours: "0 mins",
			earned: "$0.00",
		};
	}

	// Convert total minutes to hours
	const totalMinutes = events.reduce((sum, evt) => sum + evt.duration, 0);
	const totalHours = totalMinutes / 60;
	const prettyHours = getPrettyDuration(totalMinutes);

	let total = 0;
	let commissionRate = "";
	let pricePerHour = "";
	let formula = "";

	if (commission.type === "fixed") {
		// Fixed: rate/hr × hours = earnings
		total = parseFloat(commission.cph as any) * totalHours;
		pricePerHour = `$${parseFloat(commission.cph as any).toFixed(2)}/hr`;
		commissionRate = "Fixed Rate";
		formula = `$${parseFloat(commission.cph as any).toFixed(2)}/hr × ${prettyHours} = $${total.toFixed(2)}`;
	} else {
		// Percentage: rate% × (lesson_revenue / package_hours) × hours = earnings
		const packageHours = packageDurationMinutes ? packageDurationMinutes / 60 : 1;
		const pricePerHourValue = lessonRevenue ? lessonRevenue / packageHours : 0;
		const percentageAmount = lessonRevenue ? (parseFloat(commission.cph as any) / 100) * lessonRevenue : 0;
		total = percentageAmount;
		pricePerHour = `$${pricePerHourValue.toFixed(2)}/hr`;
		commissionRate = `${parseFloat(commission.cph as any).toFixed(2)}%`;
		formula = `${parseFloat(commission.cph as any).toFixed(2)}% × $${lessonRevenue?.toFixed(2) || "0.00"} = $${total.toFixed(2)}`;
	}

	return {
		total,
		formula,
		commissionRate,
		pricePerHour,
		hours: prettyHours,
		earned: `$${total.toFixed(2)}`,
	};
}
