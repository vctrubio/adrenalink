"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/src/components/ui/AnimatedCounter";
import { ClassboardStatistics } from "../../../../backend/classboard/ClassboardStatistics";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import { getDashboardStatsDisplay, STATS_GROUP_TOP, STATS_GROUP_BOTTOM } from "@/backend/RenderStats";
import { useClassboardContext } from "@/src/providers/classboard-provider";

export default function ClassboardHeaderStatsGrid() {
    const { teacherQueues, selectedDate } = useClassboardContext();

    const stats = useMemo(() => {
        const statistics = new ClassboardStatistics(teacherQueues, undefined, undefined, true);
        return statistics.getDailyLessonStats();
    }, [teacherQueues, selectedDate]);

    const displayStats = getDashboardStatsDisplay(stats);

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Row 1: Students, Teachers, Lessons */}
            <div className="flex-1 grid grid-cols-3 divide-x divide-border/30 h-full">
                {STATS_GROUP_TOP.map((key) => {
                    const stat = displayStats[key];
                    return (
                        <div key={key} className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 py-2 sm:px-3 h-full">
                            <stat.Icon size={16} className="text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground text-[10px] sm:text-xs hidden lg:inline uppercase tracking-widest font-bold opacity-70">{stat.label}</span>
                            <span className="text-foreground font-black text-sm sm:text-base tracking-tight">
                                <AnimatedCounter value={stat.value} />
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="h-px bg-border/30 w-full" />

            {/* Row 2: Duration, Commissions, Profit */}
            <div className="flex-1 grid grid-cols-3 divide-x divide-border/30 h-full">
                {STATS_GROUP_BOTTOM.map((key) => {
                    const stat = displayStats[key];
                    const formatter = key === "duration" ? getHMDuration : getCompactNumber;
                    return (
                        <div key={key} className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 py-2 sm:px-3 h-full">
                            <stat.Icon size={16} className="text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground text-[10px] sm:text-xs hidden lg:inline uppercase tracking-widest font-bold opacity-70">{stat.label}</span>
                            <span className="text-foreground font-black text-sm sm:text-base tracking-tight">
                                {key === "duration" ? formatter(stat.value) : <AnimatedCounter value={stat.value} />}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}