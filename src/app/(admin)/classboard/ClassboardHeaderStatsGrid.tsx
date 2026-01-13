"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ClassboardStatistics, type DailyLessonStats } from "../../../../backend/classboard/ClassboardStatistics";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { StatItemUI, type StatType } from "@/backend/data/StatsData";

type StatsWithRevenue = DailyLessonStats & { commission: number; profit: number };

const STATS_MAP: { key: keyof StatsWithRevenue; type: StatType }[] = [
    { key: "studentCount", type: "students" },
    { key: "teacherCount", type: "teachers" },
    { key: "eventCount", type: "events" },
    { key: "durationCount", type: "duration" },
    { key: "commission", type: "commission" },
    { key: "profit", type: "profit" },
];

export default function ClassboardHeaderStatsGrid() {
    const { teacherQueues, selectedDate } = useClassboardContext();

    const stats = useMemo(() => {
        const statistics = new ClassboardStatistics(teacherQueues, undefined, undefined, true);
        const dailyStats = statistics.getDailyLessonStats();
        return {
            ...dailyStats,
            commission: dailyStats.revenue.commission,
            profit: dailyStats.revenue.profit,
        } as StatsWithRevenue;
    }, [teacherQueues, selectedDate]);

    return (
        <div className="flex-1 flex flex-col h-full relative">
            {/* Top Row */}
            <div className="flex-1 grid grid-cols-3 h-full relative">
                {/* Vertical dividers */}
                <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                    className="absolute left-1/3 top-0 bottom-0 w-px bg-border/30 origin-top"
                />
                <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    className="absolute left-2/3 top-0 bottom-0 w-px bg-border/30 origin-top"
                />
                {STATS_MAP.slice(0, 3).map((item) => {
                    const value = stats[item.key];
                    if (typeof value !== "number") return null;
                    return (
                        <motion.div
                            key={item.key}
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                                duration: 0.6,
                                ease: [0.16, 1, 0.3, 1],
                                delay: 0.2,
                            }}
                            className="flex items-center justify-center px-1 py-2 sm:px-3 h-full"
                        >
                            <StatItemUI type={item.type} value={value} className="text-xs sm:text-sm" iconColor={false} />
                        </motion.div>
                    );
                })}
            </div>

            {/* Horizontal divider */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                className="h-px bg-border/30 w-full origin-center"
            />

            {/* Bottom Row */}
            <div className="flex-1 grid grid-cols-3 h-full relative">
                {/* Vertical dividers */}
                <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                    className="absolute left-1/3 top-0 bottom-0 w-px bg-border/30 origin-top"
                />
                <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
                    className="absolute left-2/3 top-0 bottom-0 w-px bg-border/30 origin-top"
                />
                {STATS_MAP.slice(3, 6).map((item) => {
                    const value = stats[item.key];
                    if (typeof value !== "number") return null;
                    return (
                        <motion.div
                            key={item.key}
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                                duration: 0.6,
                                ease: [0.16, 1, 0.3, 1],
                                delay: 0.45,
                            }}
                            className="flex items-center justify-center px-1 py-2 sm:px-3 h-full"
                        >
                            <StatItemUI type={item.type} value={value} className="text-xs sm:text-sm" iconColor={false} />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
