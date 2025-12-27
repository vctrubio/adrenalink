import { BookingDataboard } from "@/getters/databoard-getter";
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
		const totalRevenue = bookings.reduce((sum, booking) => sum + BookingDataboard.getRevenue(booking), 0);

		// Build stats using stat-factory as single source of truth
		// Bookings page shows: Events, Duration, Revenue (with TrendingUp/Down)
		const stats: StatItem[] = [];

		if (includeCount) {
			const bookingStat = createStat("bookings", bookings.length, "Bookings");
			if (bookingStat) stats.push(bookingStat);
		}

		const eventsStat = createStat("events", totalEvents, "Events");
		if (eventsStat) stats.push(eventsStat);

		const durationStat = createStat("duration", totalDurationMinutes, "Duration");
		if (durationStat) stats.push(durationStat);

		const revenueStat = createStat("revenue", totalRevenue, "Revenue");
		if (revenueStat) stats.push(revenueStat);

		return stats;
	},
};
