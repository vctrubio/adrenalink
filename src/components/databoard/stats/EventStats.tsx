import { EventStats as EventStatsGetter } from "@/getters/event-getter";
import type { StatItem } from "@/src/components/ui/row";
import type { EventModel } from "@/backend/models";
import BankIcon from "@/public/appSvgs/BankIcon";
import { Users } from "lucide-react";
import { ENTITY_DATA } from "@/config/entities"; // Import ENTITY_DATA
import CreditIcon from "@/public/appSvgs/CreditIcon"; // Import CreditIcon
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon"; // Import HandshakeIcon
import DurationIcon from "@/public/appSvgs/DurationIcon"; // Import DurationIcon
import { getFullDuration } from "@/getters/duration-getter"; // Import getFullDuration

export const EventStats = {
    getStats: (items: EventModel | EventModel[]): StatItem[] => {
        const isArray = Array.isArray(items);
        const events = isArray ? items : [items];

        const paymentEntity = ENTITY_DATA.find((e) => e.id === "payment")!;
        const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission")!;

        const totalStudentsPaid = events.reduce((sum, event) => sum + EventStatsGetter.getStudentsPaid(event), 0);
        const totalTeacherCommission = events.reduce((sum, event) => sum + EventStatsGetter.getTeacherCommission(event), 0);
        const totalRevenue = events.reduce((sum, event) => sum + EventStatsGetter.getRevenue(event), 0);
        const totalDuration = events.reduce((sum, event) => sum + (event.schema.duration || 0), 0);
        const revenueColor = totalRevenue >= 0 ? "#10b981" : "#ef4444";

        return [
            { icon: <DurationIcon className="w-5 h-5" />, value: getFullDuration(totalDuration), label: "Duration", color: "#4b5563" },
            { icon: <CreditIcon className="w-5 h-5" />, value: `${totalStudentsPaid.toFixed(2)}`, label: "Payments", color: paymentEntity.color },
            { icon: <HandshakeIcon className="w-5 h-5" />, value: `${totalTeacherCommission.toFixed(2)}`, label: "Commissions", color: commissionEntity.color },
            { icon: <BankIcon className="w-5 h-5" />, value: `${Math.abs(totalRevenue).toFixed(2)}`, label: "Revenue", color: revenueColor },
        ];
    },
};
