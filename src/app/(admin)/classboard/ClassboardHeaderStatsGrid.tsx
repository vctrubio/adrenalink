"use client";

import { useMemo } from "react";
import { ClassboardStatistics } from "../../../../backend/classboard/ClassboardStatistics";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { StatItemUI, type StatType } from "@/backend/data/StatsData";

const STATS_MAP: { key: keyof ClassboardStatistics["_cache"]["dailyLessonStats"]; type: StatType }[] = [
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
        };
    }, [teacherQueues, selectedDate]);

    const renderStat = (key: keyof typeof stats, type: StatType) => (
        <div key={key} className="flex items-center justify-center px-1 py-2 sm:px-3 h-full">
            <StatItemUI type={type} value={stats[key]} className="text-xs sm:text-sm" iconColor={true} />
        </div>
    );

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 grid grid-cols-3 divide-x divide-border/30 h-full">
                {STATS_MAP.slice(0, 3).map((item) => renderStat(item.key, item.type))}
            </div>

            <div className="h-px bg-border/30 w-full" />

            <div className="flex-1 grid grid-cols-3 divide-x divide-border/30 h-full">
                {STATS_MAP.slice(3, 6).map((item) => renderStat(item.key, item.type))}
            </div>
        </div>
    );
}
