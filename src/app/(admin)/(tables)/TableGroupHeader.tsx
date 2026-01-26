"use client";

import React from "react";
import { GroupingType, GroupStats } from "./MasterTable";
import { StatItemUI } from "@/backend/data/StatsData";

interface TableGroupHeaderProps {
    title: string;
    stats: GroupStats;
    groupBy: GroupingType;
    children?: React.ReactNode;
}

export function TableGroupHeader({ title, stats, groupBy, children }: TableGroupHeaderProps) {
    return (
        <tr className="bg-muted/30 border-b-2 border-border">
            <td colSpan={12} className="px-2 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{title}</span>
                        {children}
                    </div>
                </div>
            </td>
        </tr>
    );
}

interface TableMobileGroupHeaderProps {
    title: string;
    stats: GroupStats;
    groupBy: GroupingType;
    children?: React.ReactNode;
}

export function TableMobileGroupHeader({ title, stats, groupBy, children }: TableMobileGroupHeaderProps) {
    return (
        <tr className="bg-muted/30 border-b-2 border-border">
            <td colSpan={4} className="px-3 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{title}</span>
                        {children}
                    </div>
                </div>
            </td>
        </tr>
    );
}

interface GroupHeaderStatsProps {
    stats: GroupStats;
    hideLabel?: boolean;
}

export function GroupHeaderStats({ stats, hideLabel = false }: GroupHeaderStatsProps) {
    return (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {!hideLabel && <span className="font-medium">Stats:</span>}
            <StatItemUI
                label="Events"
                value={stats.totalEvents}
                className="text-xs"
            />
            <StatItemUI
                label="Revenue"
                value={stats.totalRevenue}
                format="currency"
                className="text-xs"
            />
            <StatItemUI
                label="Duration"
                value={stats.totalDuration}
                format="duration"
                className="text-xs"
            />
        </div>
    );
}