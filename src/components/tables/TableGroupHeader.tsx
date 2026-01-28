"use client";

import { Calendar, ChevronDown, ChevronRight } from "lucide-react";
import type { GroupStats, GroupingType } from "@/src/app/(admin)/(tables)/MasterTable";

interface TableGroupHeaderProps {
    title: string;
    stats: GroupStats;
    groupBy: GroupingType;
    children: React.ReactNode;
    colSpan?: number;
    isCollapsed?: boolean;
    onToggle?: () => void;
}

function getWeekNumber(d: Date) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return weekNo;
}

export function TableGroupHeader({ title, stats, groupBy, children, colSpan = 20, isCollapsed, onToggle }: TableGroupHeaderProps) {
    let displayTitle = title;
    if (groupBy === "date") {
        displayTitle = new Date(title).toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } else if (groupBy === "week") {
        if (title.includes("-W")) {
            const [year, weekNum] = title.split("-W");
            const firstDayOfYear = new Date(parseInt(year), 0, 1);
            const daysOffset = (parseInt(weekNum) - 1) * 7 - firstDayOfYear.getDay();
            const weekStartDate = new Date(firstDayOfYear);
            weekStartDate.setDate(firstDayOfYear.getDate() + daysOffset);
            const monthName = weekStartDate.toLocaleDateString(undefined, { month: "long" });
            displayTitle = `Week ${weekNum}, ${monthName} ${year}`;
        } else {
            const weekStartDate = new Date(title);
            const weekNum = getWeekNumber(weekStartDate);
            const monthName = weekStartDate.toLocaleDateString(undefined, { month: "long" });
            const year = weekStartDate.getFullYear();
            displayTitle = `Week ${weekNum}, ${monthName} ${year}`;
        }
    } else if (groupBy === "month") {
        const [year, month] = title.split("-");
        displayTitle = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
    }

    return (
        <tr
            key={`header-${title}`}
            className="bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent border-y border-primary/10 cursor-pointer hover:bg-primary/[0.08] transition-colors group/header"
            onClick={onToggle}
        >
            <td colSpan={colSpan} className="px-4 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover/header:bg-primary/20 transition-colors">
                            {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronDown size={14} strokeWidth={3} />}
                        </div>
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Calendar size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-black text-foreground uppercase tracking-tight">{displayTitle}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">{children}</div>
                </div>
            </td>
        </tr>
    );
}

export function TableMobileGroupHeader({ title, stats, groupBy, children, colSpan = 5, isCollapsed, onToggle }: TableGroupHeaderProps) {
    let displayTitle = title;
    if (groupBy === "date") {
        displayTitle = new Date(title).toLocaleDateString(undefined, { day: "numeric", month: "short" });
    } else if (groupBy === "week") {
        if (title.includes("-W")) {
            const [year, weekNum] = title.split("-W");
            const firstDayOfYear = new Date(parseInt(year), 0, 1);
            const daysOffset = (parseInt(weekNum) - 1) * 7 - firstDayOfYear.getDay();
            const weekStartDate = new Date(firstDayOfYear);
            weekStartDate.setDate(firstDayOfYear.getDate() + daysOffset);
            const monthName = weekStartDate.toLocaleDateString(undefined, { month: "short" });
            displayTitle = `W${weekNum}, ${monthName}`;
        } else {
            const weekStartDate = new Date(title);
            const weekNum = getWeekNumber(weekStartDate);
            const monthName = weekStartDate.toLocaleDateString(undefined, { month: "short" });
            displayTitle = `W${weekNum}, ${monthName}`;
        }
    } else if (groupBy === "month") {
        const [year, month] = title.split("-");
        displayTitle = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(undefined, { month: "short" });
    }

    return (
        <tr key={`mobile-header-${title}`} className="bg-primary/[0.03] cursor-pointer" onClick={onToggle}>
            <td colSpan={colSpan} className="px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="text-primary/50">
                            {isCollapsed ? <ChevronRight size={12} strokeWidth={3} /> : <ChevronDown size={12} strokeWidth={3} />}
                        </div>
                        <div className="p-1 rounded bg-primary/10 text-primary">
                            <Calendar size={12} strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-black text-foreground">{displayTitle}</span>
                    </div>
                    <div className="flex items-center gap-3">{children}</div>
                </div>
            </td>
        </tr>
    );
}
