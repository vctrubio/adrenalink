import type { DataboardFilterByDate, DataboardGroupByDate } from "@/types/databoard";
import type { StatItem } from "@/src/components/ui/row";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";

export const DATABOARD_DATE_FILTERS: DataboardFilterByDate[] = [
    "All",
    "Last 7 days",
    "Last 30 days"
];

export const DATABOARD_DATE_GROUPS: DataboardGroupByDate[] = [
    "All",
    "Daily",
    "Weekly",
    "Monthly"
];

export const DATABOARD_STATS_CONFIG: Record<string, (data: any[]) => StatItem[]> = {
    student: (students) => {
        const totalBookings = students.length * 12;
        const totalEvents = students.length * 8;
        const totalHours = students.length * 24;

        return [
            { icon: <BookingIcon className="w-5 h-5" />, value: totalBookings },
            { icon: <FlagIcon className="w-5 h-5" />, value: totalEvents },
            { icon: <DurationIcon className="w-5 h-5" />, value: totalHours },
        ];
    },
};

export const DATABOARD_ENTITY_SEARCH_FIELDS: Record<string, string[]> = {
    student: ["firstName", "lastName", "phone", "passport"],
};
