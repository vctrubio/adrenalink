import { EventStats as EventStatsGetter } from "@/getters/event-getter";
import type { StatItem } from "@/src/components/ui/row";
import type { EventModel } from "@/backend/models";
import BankIcon from "@/public/appSvgs/BankIcon";
import { ENTITY_DATA } from "@/config/entities";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { getFullDuration } from "@/getters/duration-getter";

export const EventIdStats = {
    getStats: (event: EventModel): StatItem[] => {
        const paymentEntity = ENTITY_DATA.find((e) => e.id === "payment")!;
        const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission")!;

        const studentsPaid = EventStatsGetter.getStudentsPaid(event);
        const teacherCommission = EventStatsGetter.getTeacherCommission(event);
        const revenue = EventStatsGetter.getRevenue(event);
        const duration = event.schema.duration || 0;
        const revenueColor = revenue >= 0 ? "#10b981" : "#ef4444";

        return [
            { icon: <DurationIcon />, value: getFullDuration(duration), label: "Duration", color: "#4b5563" },
            { icon: <CreditIcon />, value: studentsPaid.toFixed(2), label: "Payments", color: paymentEntity.color },
            { icon: <HandshakeIcon />, value: teacherCommission.toFixed(2), label: "Commissions", color: commissionEntity.color },
            { icon: <BankIcon />, value: Math.abs(revenue).toFixed(2), label: "Revenue", color: revenueColor },
        ];
    },
};

