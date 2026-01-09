"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/src/components/ui/AnimatedCounter";
import { DailyLessonStats } from "../../../../backend/classboard/ClassboardStatistics";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import { getDashboardStatsDisplay, STATS_GROUP_TOP, STATS_GROUP_BOTTOM } from "@/backend/RenderStats";

export default function ClassboardHeaderStatsGrid({ stats }: { stats: DailyLessonStats }) {
    const displayStats = getDashboardStatsDisplay(stats);

    return (
        <div className="flex-1 min-w-[280px] rounded-2xl bg-card border border-zinc-200 dark:border-zinc-700 p-2">
            {/* Row 1: Students, Teachers, Lessons */}
            <div className="grid grid-cols-3 divide-x divide-zinc-400 dark:divide-zinc-500">
                {STATS_GROUP_TOP.map((key) => {
                    const stat = displayStats[key];
                    return (
                        <div
                            key={key}
                            className="flex items-center justify-center gap-2 py-2 px-3"
                        >
                            <stat.Icon size={16} className="text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground text-xs hidden lg:inline">
                                {stat.label}
                            </span>
                            <span className="text-foreground font-semibold">
                                {stat.value}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Horizontal divider with gap */}
            <div className="h-px bg-zinc-400 dark:bg-zinc-500 my-2 mx-2 opacity-30" />

            {/* Row 2: Duration, Commissions, Profit */}
            <div className="grid grid-cols-3 divide-x divide-zinc-400 dark:divide-zinc-500">
                {STATS_GROUP_BOTTOM.map((key) => {
                    const stat = displayStats[key];
                    // Use appropriate formatter based on key
                    const formatter = key === "duration" ? getHMDuration : getCompactNumber;

                    return (
                        <div
                            key={key}
                            className="flex items-center justify-center gap-2 py-2 px-3"
                        >
                            <stat.Icon size={16} className="text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground text-xs hidden lg:inline">
                                {stat.label}
                            </span>
                            <span className="text-foreground font-semibold">
                                {formatter(stat.value)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
