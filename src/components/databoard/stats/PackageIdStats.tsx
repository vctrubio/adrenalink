import type { SchoolPackageModel } from "@/backend/models";
import type { StatItem } from "@/src/components/ui/row";
import { getFullDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";

export const PackageIdStats = {
    getStats: (schoolPackage: SchoolPackageModel): StatItem[] => {
        const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
        const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

        const studentCount = schoolPackage.stats?.student_count || 0;
        const eventsCount = schoolPackage.stats?.events_count || 0;
        const durationMinutes = schoolPackage.stats?.total_duration_minutes || 0;
        const revenue = schoolPackage.stats?.money_in || 0;

        return [
            {
                label: "Students",
                icon: <HelmetIcon />,
                value: studentCount,
                color: studentEntity.color,
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
                label: "Revenue",
                icon: <BankIcon />,
                value: revenue.toFixed(2),
                color: "#10b981",
            },
        ];
    }
}

