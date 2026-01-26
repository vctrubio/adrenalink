import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { getPPP } from "@/getters/integer-getter";

interface LessonEventDurationBadgeProps {
    status?: string;
    events: number;
    hours: number;
}

export function LessonEventDurationBadge({ status, events, hours }: LessonEventDurationBadgeProps) {
    return (
        <div className="flex items-center gap-3 px-2.5 py-1 rounded-lg text-xs font-bold bg-muted/30 text-foreground">
            <div className="flex items-center gap-1">
                <FlagIcon size={14} />
                <span>{events}</span>
            </div>
            <div className="flex items-center gap-1">
                <DurationIcon size={14} />
                <span>{getPPP(hours)}h</span>
            </div>
        </div>
    );
}
