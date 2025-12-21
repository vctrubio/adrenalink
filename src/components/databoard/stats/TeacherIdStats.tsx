import type { TeacherModel } from "@/backend/models";
import type { StatItem } from "@/src/components/ui/row";
import { getFullDuration, getPrettyDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import { TeacherStats as TeacherStatsGetter } from "@/getters/teachers-getter";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";

export const TeacherIdStats = {
    getStats: (teacher: TeacherModel): StatItem[] => {
        const lessonEntity = ENTITY_DATA.find((e) => e.id === "lesson")!;
        const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
        const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission");

        const lessonsCount = TeacherStatsGetter.getLessonsCount(teacher);
        const eventsCount = TeacherStatsGetter.getEventsCount(teacher);
        const durationMinutes = teacher.stats?.total_duration_minutes || 0;
        const commissions = TeacherStatsGetter.getTotalCommissions(teacher);
        const revenue = TeacherStatsGetter.getTotalRevenue(teacher);

        return [
            {
                label: "Lessons",
                icon: <LessonIcon />,
                value: lessonsCount,
                color: lessonEntity.color,
            },
            {
                label: "Events",
                icon: <FlagIcon />,
                value: eventsCount,
                color: eventEntity.color,
            },
            {
                label: "Duration",
                icon: <DurationIcon />,
                value: getFullDuration(durationMinutes),
                color: "#4b5563",
            },
            {
                label: "Commissions",
                icon: <HandshakeIcon />,
                value: commissions.toFixed(2),
                color: commissionEntity?.color || "#a78bfa",
            },
            {
                label: "Revenue",
                icon: <BankIcon />,
                value: revenue.toFixed(2),
                color: "#10b981",
            },
        ];
    },
};
