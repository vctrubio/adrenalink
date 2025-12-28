import { BookingDataboard } from "@/getters/databoard-getter";
import { BookingStats as BookingStatsGetter } from "@/getters/bookings-getter";
import { createStat } from "./stat-factory";
import type { StatItem } from "@/src/components/ui/row";
import type { BookingModel } from "@/backend/models";

export const BookingStats = {
	getStats: (items: BookingModel | BookingModel[], includeCount = true): StatItem[] => {
		const isArray = Array.isArray(items);
		const bookings = isArray ? items : [items];

		// Aggregate stats across all bookings using databoard-getter
		const totalEvents = bookings.reduce((sum, booking) => sum + BookingDataboard.getEventCount(booking), 0);
		const totalDurationMinutes = bookings.reduce((sum, booking) => sum + BookingDataboard.getDurationMinutes(booking), 0);
		const totalProfit = bookings.reduce((sum, booking) => sum + BookingDataboard.getRevenue(booking), 0);
		const totalStudentPayments = bookings.reduce((sum, booking) => sum + BookingStatsGetter.getStudentPayments(booking), 0);
		const totalDue = totalProfit - totalStudentPayments;

		// Build stats using stat-factory as single source of truth
		// Bookings page shows: Events, Duration, Profit, Due
		const stats: StatItem[] = [];

		if (includeCount) {
			const bookingStat = createStat("bookings", bookings.length, "Bookings");
			if (bookingStat) stats.push(bookingStat);
		}

		const eventsStat = createStat("events", totalEvents, "Events");
		if (eventsStat) stats.push(eventsStat);

		const durationStat = createStat("duration", totalDurationMinutes, "Duration");
		if (durationStat) stats.push(durationStat);

		const profitStat = createStat("profit", totalProfit, "Profit");
		if (profitStat) stats.push(profitStat);

		const dueStat = createStat("moneyToPay", totalDue, "Due");
		if (dueStat) stats.push(dueStat);

		return stats;
	},
};
