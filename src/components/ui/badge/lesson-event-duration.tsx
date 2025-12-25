import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { LESSON_STATUS_CONFIG } from "@/types/status";

interface LessonEventDurationBadgeProps {
    status?: string;
    events: number;
    hours: number;
}

export function LessonEventDurationBadge({ status, events, hours }: LessonEventDurationBadgeProps) {
    const config = status ? (LESSON_STATUS_CONFIG[status as keyof typeof LESSON_STATUS_CONFIG] || { color: "#888", label: status }) : { color: "#888", label: "Unknown" };

    return (
        <div 
            className="flex items-center gap-3 px-2.5 py-1 rounded-lg text-xs font-bold" 
            style={{ backgroundColor: `${config.color}20`, color: config.color }}
        >
            <div className="flex items-center gap-1">
                <FlagIcon size={14} />
                <span>{events}</span>
            </div>
            <div className="flex items-center gap-1">
                <DurationIcon size={14} />
                <span>{hours.toFixed(1)}h</span>
            </div>
        </div>
    );
}
