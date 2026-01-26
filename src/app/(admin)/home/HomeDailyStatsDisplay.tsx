"use client";

import React from "react";
import { StatItemUI } from "@/backend/data/StatsData";
import { getHMDuration } from "@/getters/duration-getter";
import type { DailyLessonStats } from "@/backend/classboard/ClassboardStatistics";
import type { TransactionEventData } from "@/types/transaction-event";

interface HomeDailyStatsDisplayProps {
    stats: DailyLessonStats;
    events: TransactionEventData[]; // For calculating completed/total events
}

export function HomeDailyStatsDisplay({ stats, events }: HomeDailyStatsDisplayProps) {
    const completedEvents = events.filter((e) => e.event.status === "completed" || e.event.status === "uncompleted").length;
    const totalEvents = events.length;

    return (
        <div className="flex items-center gap-4 sm:gap-6 text-sm">
            {/* Completed - Always visible on sm+ */}
            <div className="flex items-center gap-4 border-r border-border/50 pr-4">
                {/* Desktop version with labels */}
                <div className="hidden xl:block">
                    <StatItemUI
                        type="completed"
                        value={`${completedEvents}/${totalEvents}`}
                        className="justify-center"
                        hideLabel={false}
                    />
                </div>
                {/* Mobile/tablet version without labels */}
                <div className="xl:hidden">
                    <StatItemUI
                        type="completed"
                        value={`${completedEvents}/${totalEvents}`}
                        className="justify-center"
                        hideLabel={true}
                    />
                </div>
            </div>

            {/* Students - Hidden on sm, visible on md+ */}
            <div className="hidden md:block">
                {/* Desktop with labels */}
                <div className="hidden xl:block">
                    <StatItemUI type="students" value={stats.studentCount} className="justify-center" hideLabel={false} />
                </div>
                {/* md/lg without labels */}
                <div className="xl:hidden">
                    <StatItemUI type="students" value={stats.studentCount} className="justify-center" hideLabel={true} />
                </div>
            </div>

            {/* Teachers - Hidden on sm, visible on md+ */}
            <div className="hidden md:block">
                {/* Desktop with labels */}
                <div className="hidden xl:block">
                    <StatItemUI type="teachers" value={stats.teacherCount} className="justify-center" hideLabel={false} />
                </div>
                {/* md/lg without labels */}
                <div className="xl:hidden">
                    <StatItemUI type="teachers" value={stats.teacherCount} className="justify-center" hideLabel={true} />
                </div>
            </div>

            {/* Duration - Hidden on sm, visible on md+ */}
            <div className="hidden md:block">
                {/* Desktop with labels */}
                <div className="hidden xl:block">
                    <StatItemUI type="duration" value={stats.durationCount} className="justify-center" hideLabel={false} />
                </div>
                {/* md/lg without labels */}
                <div className="xl:hidden">
                    <StatItemUI type="duration" value={stats.durationCount} className="justify-center" hideLabel={true} />
                </div>
            </div>

            {/* Revenue & Commission - Hidden on sm and md, visible on lg+ */}
            <div className="hidden lg:flex items-center gap-4 border-l border-border/50 pl-4">
                {/* Desktop version with labels */}
                <div className="hidden xl:flex items-center gap-4">
                    <StatItemUI
                        type="revenue"
                        value={stats.revenue.revenue}
                        className="justify-center"
                        hideLabel={false}
                    />
                    <StatItemUI
                        type="commission"
                        value={stats.revenue.commission}
                        className="justify-center"
                        hideLabel={false}
                    />
                    <StatItemUI
                        type="profit"
                        value={stats.revenue.profit}
                        variant="profit"
                        className="justify-center"
                        hideLabel={false}
                    />
                </div>
                {/* lg version without labels */}
                <div className="xl:hidden flex items-center gap-4">
                    <StatItemUI
                        type="revenue"
                        value={stats.revenue.revenue}
                        className="justify-center"
                        hideLabel={true}
                    />
                    <StatItemUI
                        type="commission"
                        value={stats.revenue.commission}
                        className="justify-center"
                        hideLabel={true}
                    />
                    <StatItemUI
                        type="profit"
                        value={stats.revenue.profit}
                        variant="profit"
                        className="justify-center"
                        hideLabel={true}
                    />
                </div>
            </div>

            {/* Profit - Visible on sm and md, hidden on lg+ (where it's in the revenue group) */}
            <div className="md:block lg:hidden">
                <StatItemUI type="profit" value={stats.revenue.profit} variant="profit" className="justify-center" hideLabel={true} />
            </div>
        </div>
    );
}