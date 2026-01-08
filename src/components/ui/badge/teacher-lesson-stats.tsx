"use client";

import { useRouter } from "next/navigation";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { getHMDuration } from "@/getters/duration-getter";
import { LESSON_STATUS_CONFIG } from "@/types/status";

interface TeacherLessonStatsBadgeProps {
    teacherId: string;
    teacherUsername: string;
    eventCount: number;
    durationMinutes: number;
    isLoading?: boolean;
    status?: string;
    onClick?: () => void;
    showCommission?: boolean;
    commission?: {
        type: "fixed" | "percentage";
        cph: string;
    };
    currency?: string;
}

export function TeacherLessonStatsBadge({ teacherId, teacherUsername, eventCount, durationMinutes, isLoading = false, status = "active", onClick, showCommission = false, commission }: TeacherLessonStatsBadgeProps) {
    const router = useRouter();
    const config = LESSON_STATUS_CONFIG[status as keyof typeof LESSON_STATUS_CONFIG] || { color: "#22c55e", label: status };
    const teacherColor = config.color;
    const safeDuration = durationMinutes || 0;
    const durationStr = getHMDuration(safeDuration);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClick) {
            onClick();
        } else {
            router.push(`/teachers/${teacherId}`);
        }
    };

    const cphValue = commission ? parseFloat(commission.cph) : 0;
    const formattedCommission = !isNaN(cphValue) ? Math.round(cphValue).toString() + (commission?.type === "percentage" ? "%" : "") : "0";

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors border border-border/50 text-xs group"
            title={onClick ? "Click to add event" : "View teacher details"}
        >
            <div className="relative flex items-center justify-center text-muted-foreground group-hover:text-primary">
                <div style={{ color: teacherColor, opacity: isLoading ? 0.4 : 1 }}>
                    <HeadsetIcon size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>
            <span className="font-medium text-foreground">{teacherUsername}</span>

            {showCommission && (
                <div className="flex items-center gap-1 ml-0.5">
                    <HandshakeIcon size={12} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="font-black text-[10px] ">{formattedCommission}</span>
                </div>
            )}

            <div className="h-3 w-px bg-border/60 mx-0.5" />
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-muted-foreground" title="Events">
                    <FlagIcon size={12} />
                    <span className="font-medium">{eventCount}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground" title="Duration">
                    <DurationIcon size={12} />
                    <span className="font-medium">{durationStr}</span>
                </div>
            </div>
        </button>
    );
}
