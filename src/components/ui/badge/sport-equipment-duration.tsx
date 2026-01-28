import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { getHMDuration } from "@/getters/duration-getter";
import { STATUS_GREEN } from "@/types/status";
import { useRouter } from "next/navigation";

interface SportEquipmentDurationBadgeProps {
    category: string;
    count: number;
    durationMinutes: number;
    className?: string;
    teacherUsername?: string;
    teacherId?: string;
    useCategoryColor?: boolean;
}

export function SportEquipmentDurationBadge({
    category,
    count,
    durationMinutes,
    className = "",
    teacherUsername,
    teacherId,
    useCategoryColor = false,
}: SportEquipmentDurationBadgeProps) {
    const router = useRouter();
    const config = EQUIPMENT_CATEGORIES.find((c) => c.id === category);
    const Icon = config?.icon || FlagIcon;

    const handleClick = () => {
        if (teacherId) {
            router.push(`/teachers/${teacherId}`);
        }
    };

    const bgColor = useCategoryColor && config ? `${config.color}15` : undefined;
    const borderColor = useCategoryColor && config ? `${config.color}40` : undefined;
    const iconColor = useCategoryColor && config ? config.color : STATUS_GREEN;

    return (
        <div
            onClick={teacherId ? handleClick : undefined}
            className={`flex items-center gap-3 px-2 py-1.5 rounded-lg border transition-colors ${
                useCategoryColor 
                    ? "" 
                    : "border-green-600/40 dark:border-green-700/30 bg-green-600/15 dark:bg-green-700/10"
            } ${teacherId ? "cursor-pointer hover:opacity-80" : ""} ${className}`}
            style={{
                backgroundColor: bgColor,
                borderColor: borderColor,
            }}
        >
            {teacherUsername && (
                <div 
                    className="flex items-center gap-2 pr-2 border-r" 
                    style={{ borderRightColor: borderColor || "rgba(22, 163, 74, 0.2)" }}
                >
                    <HeadsetIcon size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-black text-foreground uppercase tracking-tight">{teacherUsername}</span>
                </div>
            )}

            <div className="flex items-center gap-1.5" title="Lessons Count">
                <div style={{ color: iconColor }}>
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
