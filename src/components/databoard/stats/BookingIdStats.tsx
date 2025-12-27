import type { BookingModel } from "@/backend/models";
import type { StatItem } from "@/src/components/ui/row";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import { ENTITY_DATA } from "@/config/entities";
import { BookingStats as BookingStatsGetter } from "@/getters/bookings-getter";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { TrendingUp, TrendingDown } from "lucide-react";

export const BookingIdStats = {
    getStats: (booking: BookingModel): StatItem[] => {
        const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission")!;
        const paymentEntity = ENTITY_DATA.find((e) => e.id === "payment")!;
        const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
        
        const eventsCount = BookingStatsGetter.getEventsCount(booking);
        const durationMinutes = booking.stats?.total_duration_minutes || 0;
        
        // 1. Revenue: Total generated value based on events and package price
        const revenue = BookingStatsGetter.getMoneyIn(booking);
        
        // 2. Student Payments: Actual money collected
        const studentPayments = BookingStatsGetter.getStudentPayments(booking);
        
        // 3. Commissions: Money owed/paid to teachers
        const commissions = BookingStatsGetter.getTeacherCommissions(booking);
        
        // 4. Net: Revenue - Commissions (Profit)
        const net = revenue - commissions;

        // 5. Due: Revenue - Student Payments (Outstanding balance)
        const due = revenue - studentPayments;

        const netColor = "rgb(251, 146, 60)"; // Always orange for net
        const dueColor = due > 0 ? "#ef4444" : "#10b981"; // Red if they owe money, Green if fully paid

        const CommissionIcon = commissionEntity.icon;
        const PaymentIcon = paymentEntity.icon;

        const allStats: (StatItem & { rawValue: number })[] = [
            {
                label: "Events",
                icon: <FlagIcon />,
                value: eventsCount,
                color: eventEntity.color,
                rawValue: eventsCount
            },
            {
                label: "Duration",
                icon: <DurationIcon />,
                value: getHMDuration(durationMinutes),
                color: "#4b5563",
                rawValue: durationMinutes
            },
            {
                label: "Student Payments",
                icon: <PaymentIcon />,
                value: studentPayments,
                color: paymentEntity.color,
                rawValue: studentPayments
            },
            {
                label: "Commissions",
                icon: <CommissionIcon />,
                value: commissions,
                color: commissionEntity.color,
                rawValue: commissions
            },
            {
                label: "Revenue",
                icon: <TrendingUp />,
                value: revenue,
                color: "#10b981",
                rawValue: revenue
            },
            {
                label: "Net",
                icon: net >= 0 ? <TrendingUp /> : <TrendingDown />,
                value: getCompactNumber(net),
                color: netColor,
                rawValue: net
            },
            {
                label: "Due",
                icon: <PaymentIcon />,
                value: due,
                color: dueColor,
                rawValue: due
            },
        ];

        // Filter out stats with 0 value
        return allStats
            .filter(stat => stat.rawValue !== 0)
            .map(({ rawValue, ...stat }) => stat);
    }
};

