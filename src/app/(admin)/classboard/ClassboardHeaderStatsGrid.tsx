"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/src/components/ui/AnimatedCounter";
import { DailyLessonStats } from "../../../../backend/classboard/ClassboardStatistics";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import { getDashboardStatsDisplay, STATS_GROUP_TOP, STATS_GROUP_BOTTOM } from "@/getters/classboard-getter";

export default function ClassboardHeaderStatsGrid({ stats }: { stats: DailyLessonStats }) {
    const displayStats = getDashboardStatsDisplay(stats);

    return (
        <div className="flex-1 min-w-[280px] rounded-2xl bg-card border border-zinc-200 dark:border-zinc-700 p-2">
            {/* Row 1: Students, Teachers, Lessons */}
            <div className="grid grid-cols-3 divide-x divide-zinc-400 dark:divide-zinc-500">
                {STATS_GROUP_TOP.map((key, index) => {
                    const stat = displayStats[key];
                    return (
                        <motion.div
                            key={key}
                            className="flex items-center justify-center gap-2 py-2 px-3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <stat.Icon size={16} className="text-muted-foreground shrink-0" />
                            <motion.span
                                className="text-muted-foreground text-xs hidden lg:inline"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                            >
                                {stat.label}
                            </motion.span>
                            <span className="text-foreground font-semibold">
                                <AnimatedCounter value={stat.value} />
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Horizontal divider with gap */}
            <div className="h-px bg-zinc-400 dark:bg-zinc-500 my-2 mx-2 opacity-30" />

            {/* Row 2: Duration, Commissions, Profit */}
            <div className="grid grid-cols-3 divide-x divide-zinc-400 dark:divide-zinc-500">
                {STATS_GROUP_BOTTOM.map((key, index) => {
                    const stat = displayStats[key];
                    // Use appropriate formatter based on key
                    const formatter = key === "duration" ? getHMDuration : getCompactNumber;

                    return (
                        <motion.div
                            key={key}
                            className="flex items-center justify-center gap-2 py-2 px-3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
                        >
                            <stat.Icon size={16} className="text-muted-foreground shrink-0" />
                            <motion.span
                                className="text-muted-foreground text-xs hidden lg:inline"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                transition={{ duration: 0.2, delay: 0.45 + index * 0.05 }}
                            >
                                {stat.label}
                            </motion.span>
                            <span className="text-foreground font-semibold">
                                <AnimatedCounter value={stat.value} formatter={formatter} />
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
