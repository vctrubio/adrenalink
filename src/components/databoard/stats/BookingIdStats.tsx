import type { BookingModel } from "@/backend/models";
import type { StatItem } from "@/src/components/ui/row";
import { getPrettyDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import { BookingStats as BookingStatsGetter } from "@/getters/bookings-getter";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";

export const BookingIdStats = {
    getStats: (booking: BookingModel): StatItem[] => {
        const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
        
        const eventsCount = BookingStatsGetter.getEventsCount(booking);
        const durationMinutes = booking.stats?.total_duration_minutes || 0;
        const moneyIn = BookingStatsGetter.getMoneyIn(booking);
        const moneyOut = BookingStatsGetter.getMoneyOut(booking);
        const netRevenue = moneyIn - moneyOut;
        const revenueColor = netRevenue >= 0 ? "#10b981" : "#ef4444";

        return [
            {
                label: "Events",
                icon: <FlagIcon />,
                value: eventsCount,
                color: eventEntity.color,
            },
            {
                label: "Duration",
                icon: <DurationIcon />,
                value: getPrettyDuration(durationMinutes),
                color: "#4b5563",
            },
            {
                label: "Money In/Paid by Students",
                icon: <BankIcon />,
                value: moneyIn.toFixed(2),
                color: "#4b5563",
            },
            {
                label: "Money Out/Paid to Teachers",
                icon: <BankIcon />,
                value: moneyOut.toFixed(2),
                color: "#4b5563",
            },
            {
                label: "Revenue",
                icon: <BankIcon />,
                value: Math.abs(netRevenue).toFixed(2),
                color: revenueColor,
            },
        ];
    }
}

