"use client";

import { motion } from "framer-motion";
import { type EventStatusMinutes } from "@/getters/booking-progress-getter";
import { EVENT_STATUS_CONFIG } from "@/types/status";

interface ClassboardProgressBarProps {
    durationMinutes: number;
    counts: EventStatusMinutes;
}

export function ClassboardProgressBar({ durationMinutes, counts }: ClassboardProgressBarProps) {
    const totalUsedMinutes = (counts.completed || 0) + (counts.uncompleted || 0) + (counts.planned || 0) + (counts.tbc || 0);
    const denominator = totalUsedMinutes > durationMinutes ? totalUsedMinutes : durationMinutes;

    if (denominator === 0) {
        return <div className="h-1.5 w-full bg-muted/30" />;
    }

    const segments = [
        { key: "completed", value: counts.completed, color: EVENT_STATUS_CONFIG.completed.color },
        { key: "uncompleted", value: counts.uncompleted, color: EVENT_STATUS_CONFIG.uncompleted.color },
        { key: "planned", value: counts.planned, color: EVENT_STATUS_CONFIG.planned.color },
        { key: "tbc", value: counts.tbc, color: EVENT_STATUS_CONFIG.tbc.color },
    ];

    return (
        <div className="h-1.5 w-full bg-muted/30 flex overflow-hidden">
            {segments.map((segment) => {
                const widthPercent = (segment.value / denominator) * 100;
                if (widthPercent <= 0) return null;

                return (
                    <motion.div
                        key={segment.key}
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercent}%` }}
                        transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 20,
                            mass: 1,
                        }}
                        style={{ backgroundColor: segment.color }}
                        className="h-full"
                    />
                );
            })}
        </div>
    );
}
