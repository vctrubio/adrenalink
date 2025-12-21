import { ENTITY_DATA } from "@/config/entities";
import { BookingStats as BookingStatsGetter } from "@/getters/bookings-getter";
import { getFullDuration } from "@/getters/duration-getter";
import type { StatItem } from "@/src/components/ui/row";
import type { BookingModel } from "@/backend/models";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";

export const BookingStats = {
	getStats: (items: BookingModel | BookingModel[], includeCount = true): StatItem[] => {
		const isArray = Array.isArray(items);
		const bookings = isArray ? items : [items];

		const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
		const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

		const totalEvents = bookings.reduce((sum, booking) => sum + BookingStatsGetter.getEventsCount(booking), 0);
		const totalMinutes = bookings.reduce((sum, booking) => sum + (booking.stats?.total_duration_minutes || 0), 0);
		const totalMoneyIn = bookings.reduce((sum, booking) => sum + BookingStatsGetter.getMoneyIn(booking), 0);
		const totalMoneyOut = bookings.reduce((sum, booking) => sum + BookingStatsGetter.getMoneyOut(booking), 0);
		const netRevenue = totalMoneyIn - totalMoneyOut;
		const bankColor = netRevenue >= 0 ? "#10b981" : "#ef4444";

		const stats: StatItem[] = [];

		if (includeCount) {
			stats.push({ icon: <BookingIcon className="w-5 h-5" />, value: bookings.length, label: "Bookings", color: bookingEntity.color });
		}

		stats.push(
			{ icon: <FlagIcon className="w-5 h-5" />, value: totalEvents, label: "Events", color: eventEntity.color },
			{ icon: <DurationIcon className="w-5 h-5" />, value: getFullDuration(totalMinutes), label: "Duration", color: "#4b5563" },
			{ icon: <BankIcon className="w-5 h-5" />, value: Math.abs(netRevenue), label: "Revenue", color: bankColor }
		);

		return stats;
	},
};
