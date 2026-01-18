import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { getHMDuration } from "@/getters/duration-getter";
import { STATUS_GREEN } from "@/types/status";

interface SportEquipmentDurationBadgeProps {
    category: string;
    count: number;
    durationMinutes: number;
    className?: string;
}

export function SportEquipmentDurationBadge({ category, count, durationMinutes, className = "" }: SportEquipmentDurationBadgeProps) {
    const config = EQUIPMENT_CATEGORIES.find((c) => c.id === category);
    const Icon = config?.icon || FlagIcon;

    return (
        <div
            className={`flex items-center gap-3 px-2 py-1 rounded-lg border border-green-600/40 dark:border-green-700/30 bg-green-600/15 dark:bg-green-700/10 ${className}`}
        >
            <div className="flex items-center gap-1.5" title="Lessons Count">
                <div style={{ color: STATUS_GREEN }}>
                    <Icon size={14} />
                </div>
                <span className="text-xs font-bold text-foreground">{count}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs" title="Total Duration">
                <DurationIcon size={12} className="text-foreground/70" />
                <span className="text-xs font-bold text-foreground">{getHMDuration(durationMinutes)}</span>
            </div>
        </div>
    );
}

export function SportEquipmentDurationList({
    stats,
    className = "",
}: {
    stats: Record<string, { count: number; durationMinutes: number }>;
    className?: string;
}) {
    const entries = Object.entries(stats);
    if (entries.length === 0) {
        return <span className="text-xs text-muted-foreground italic">-</span>;
    }

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {entries.map(([category, data]) => (
                <SportEquipmentDurationBadge
                    key={category}
                    category={category}
                    count={data.count}
                    durationMinutes={data.durationMinutes}
                />
            ))}
        </div>
    );
}
