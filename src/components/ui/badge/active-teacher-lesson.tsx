"use client";

import { useRouter } from "next/navigation";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { LESSON_STATUS_CONFIG, type LessonStatus } from "@/types/status";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";

interface ActiveTeacherLessonBadgeProps {
    bookingId: string;
    category: string;
    leaderName: string;
    capacity: number;
    status: string;
    commission: {
        type: "fixed" | "percentage";
        cph: string;
    };
}

export function ActiveTeacherLessonBadge({ 
    bookingId, 
    category, 
    leaderName, 
    capacity,
    status,
    commission
}: ActiveTeacherLessonBadgeProps) {
    const router = useRouter();
    const equipmentConfig = EQUIPMENT_CATEGORIES.find(c => c.id === category);
    const Icon = equipmentConfig?.icon || (() => null);
    
    // Theme selection based on status
    const isRest = status === "rest";
    const bgClass = isRest ? "bg-zinc-100/50 dark:bg-zinc-800/30" : "bg-blue-100/50 dark:bg-blue-900/30";
    const textClass = isRest ? "text-zinc-600 dark:text-zinc-400" : "text-blue-700 dark:text-blue-300";
    const borderClass = isRest ? "border-zinc-200 dark:border-zinc-800/50" : "border-blue-200 dark:border-blue-800/50";
    const iconOpacity = isRest ? "opacity-40" : "";

    const cphValue = parseFloat(commission.cph);
    const formattedCommission = !isNaN(cphValue)
        ? Math.round(cphValue).toString() + (commission.type === "percentage" ? "%" : "")
        : "0";

    return (
        <button
            onClick={() => router.push(`/bookings/${bookingId}`)}
            className={`flex items-center gap-2 px-2 py-1 rounded-lg border ${bgClass} ${borderClass} transition-all hover:opacity-80 group max-w-[200px]`}
        >
            <div className={`shrink-0 ${textClass} ${iconOpacity} group-hover:scale-110 transition-transform`}>
                <Icon size={14} />
            </div>
            
            <div className="flex items-center gap-1.5 overflow-hidden">
                <span className={`text-[10px] font-bold ${textClass} truncate`}>
                    {leaderName || "Unknown"}
                </span>
                {capacity > 1 && (
                    <span className={`text-[8px] font-black opacity-60 bg-muted-foreground/10 px-1 rounded ${textClass}`}>
                        +{capacity - 1}
                    </span>
                )}

                <div className={`h-2.5 w-px ${isRest ? "bg-zinc-400/20" : "bg-blue-400/20"} mx-0.5`} />

                <div className="flex items-center gap-1 opacity-60 shrink-0">
                    <HandshakeIcon size={10} className={textClass} />
                    <span className={`text-[9px] font-black uppercase ${textClass}`}>
                        {formattedCommission}
                    </span>
                </div>
            </div>
        </button>
    );
}
