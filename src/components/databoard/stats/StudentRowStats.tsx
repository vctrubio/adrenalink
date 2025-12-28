import { StudentDataboard } from "@/getters/databoard-getter";
import { createStat } from "./stat-factory";
import type { StatItem } from "@/src/components/ui/row";
import type { StudentModel } from "@/backend/models";

export const StudentRowStats = {
	getStats: (items: StudentModel | StudentModel[], includeCount = true): StatItem[] => {
		const isArray = Array.isArray(items);
		const students = isArray ? items : [items];

		// Aggregate stats across all students
		const totalBookings = students.reduce((sum, student) => sum + StudentDataboard.getBookingCount(student), 0);
		const totalEvents = students.reduce((sum, student) => sum + StudentDataboard.getEventCount(student), 0);
		const totalDurationMinutes = students.reduce((sum, student) => sum + StudentDataboard.getDurationMinutes(student), 0);
		const totalSchoolNet = students.reduce((sum, student) => sum + StudentDataboard.getProfit(student), 0);

		// Build stats using stat-factory as single source of truth
		const stats: StatItem[] = [];

		if (includeCount) {
			const studentStat = createStat("student", students.length, "Students");
			if (studentStat) stats.push(studentStat);
		}

		const bookingsStat = createStat("bookings", totalBookings, "Bookings");
		if (bookingsStat) stats.push(bookingsStat);

		const eventsStat = createStat("events", totalEvents, "Events");
		if (eventsStat) stats.push(eventsStat);

		const durationStat = createStat("duration", totalDurationMinutes, "Duration");
		if (durationStat) stats.push(durationStat);

		const netStat = createStat("profit", totalSchoolNet, "Profit");
		if (netStat) stats.push(netStat);

		return stats;
	},
};
