// ============ TEACHER LESSON COMMISSION CALCULATION ============
// Calculates how much a teacher earned from their lessons based on their commission rate

interface CommissionData {
	type: "fixed" | "percentage";
	cph: number; // Commission per hour
}

interface TeacherCommissionResult {
	total: number;
	formula: string; // Math explanation for display
}

/**
 * Calculate total commission earned by a teacher from their lessons
 * Formula explanation:
 * - Fixed: commission_rate * total_hours = earnings
 * - Percentage: (commission_rate / 100) * total_hours = earnings
 *
 * @param events - Array of events with their durations in minutes
 * @param commission - Teacher's commission data (type and rate)
 * @returns Object with total earned amount and formula explanation
 */
export function getTeacherLessonCommission(
	events: Array<{ duration: number }>,
	commission?: CommissionData
): TeacherCommissionResult {
	if (!commission || events.length === 0) {
		return {
			total: 0,
			formula: "No commission data",
		};
	}

	// Convert total minutes to hours
	const totalMinutes = events.reduce((sum, evt) => sum + evt.duration, 0);
	const totalHours = totalMinutes / 60;

	let total = 0;
	let formula = "";

	if (commission.type === "fixed") {
		// Fixed: rate * hours = earnings
		total = commission.cph * totalHours;
		formula = `$${commission.cph.toFixed(2)}/hr × ${totalHours.toFixed(2)} hrs = $${total.toFixed(2)}`;
	} else {
		// Percentage: (rate / 100) * hours = earnings
		const percentageRate = commission.cph / 100;
		total = percentageRate * totalHours;
		formula = `${commission.cph.toFixed(2)}% × ${totalHours.toFixed(2)} hrs = $${total.toFixed(2)}`;
	}

	return {
		total,
		formula,
	};
}
