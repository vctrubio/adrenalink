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
        <div className="flex-1 rounded-lg overflow-hidden h-full">
            <div className="grid grid-cols-3 grid-rows-2 divide-x divide-y divide-border/30 h-full">
                {STATS_GROUP_TOP.map((key) => {
                    const stat = displayStats[key];
                    return (
                        <div key={key} className="flex items-center justify-center gap-2 h-full">
                            <stat.Icon size={16} className="text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground text-xs hidden lg:inline">{stat.label}</span>
                            <span className="text-foreground font-semibold">
                                <AnimatedCounter value={stat.value} />
                            </span>
                        </div>
                    );
                })}

                {STATS_GROUP_BOTTOM.map((key) => {
                    const stat = displayStats[key];
                    const formatter = key === "duration" ? getHMDuration : getCompactNumber;
                    return (
                        <div key={key} className="flex items-center justify-center gap-2 h-full">
                            <stat.Icon size={16} className="text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground text-xs hidden lg:inline">{stat.label}</span>
                            <span className="text-foreground font-semibold">
                                {key === "duration" ? formatter(stat.value) : <AnimatedCounter value={stat.value} />}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
