"use client";

import { Calendar } from "lucide-react";
import type { GroupStats, GroupingType } from "@/src/app/(admin)/(tables)/MasterTable";

interface TableGroupHeaderProps {
    title: string;
    stats: GroupStats;
    groupBy: GroupingType;
    children: React.ReactNode;
    colSpan?: number;
}

export function TableGroupHeader({ title, stats, groupBy, children, colSpan = 20 }: TableGroupHeaderProps) {
    let displayTitle = title;
    if (groupBy === "date") {
        displayTitle = new Date(title).toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } else if (groupBy === "week") {
        displayTitle = `Week ${title.split("-W")[1]} of ${title.split("-W")[0]}`;
    } else if (groupBy === "month") {
        const [year, month] = title.split("-");
        displayTitle = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
    }

    return (
        <tr
            key={`header-${title}`}
            className="bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent border-y border-primary/10"
        >
            <td colSpan={colSpan} className="px-4 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
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

export function TableMobileGroupHeader({ title, stats, groupBy, children, colSpan = 5 }: TableGroupHeaderProps) {
    let displayTitle = title;
    if (groupBy === "date") {
        displayTitle = new Date(title).toLocaleDateString(undefined, { day: "numeric", month: "short" });
    } else if (groupBy === "week") {
        displayTitle = `Week ${title.split("-W")[1]}`;
    } else if (groupBy === "month") {
        const [year, month] = title.split("-");
        displayTitle = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(undefined, { month: "short" });
    }

    return (
        <tr key={`mobile-header-${title}`} className="bg-primary/[0.03]">
            <td colSpan={colSpan} className="px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
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
