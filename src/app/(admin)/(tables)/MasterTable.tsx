"use client";

import { useMemo, ReactNode, useState } from "react";

export type GroupingType = "all" | "date" | "week";

export interface ColumnDef<T> {
    header: string;
    headerClassName?: string;
    render: (row: T) => ReactNode;
}

export interface MobileColumnDef<T> {
    label: string;
    render: (row: T) => ReactNode;
}

export type GroupStats = Record<string, any>;

interface MasterTableProps<T> {
    rows: T[];
    columns: ColumnDef<T>[];
    mobileColumns: MobileColumnDef<T>[];
    groupBy?: GroupingType;
    getGroupKey?: (row: T, groupBy: GroupingType) => string;
    calculateStats?: (rows: T[]) => GroupStats;
    renderGroupHeader?: (title: string, stats: GroupStats, groupBy: GroupingType) => ReactNode;
    renderMobileGroupHeader?: (title: string, stats: GroupStats, groupBy: GroupingType) => ReactNode;
    showGroupToggle?: boolean;
}

// Desktop table rendering
function DesktopTable<T extends Record<string, any>>({
    columns,
    groupBy,
    sortedGroupEntries,
    calculateStats,
    renderGroupHeader,
}: {
    columns: ColumnDef<T>[];
    groupBy: GroupingType;
    sortedGroupEntries: [string, T[]][];
    calculateStats?: (rows: T[]) => GroupStats;
    renderGroupHeader?: (title: string, stats: GroupStats, groupBy: GroupingType) => ReactNode;
}) {
    return (
        <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="text-[10px] uppercase bg-muted/50 text-muted-foreground border-b border-border">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className={col.headerClassName || "px-4 py-3 font-medium"}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                {sortedGroupEntries.map(([title, groupRows]) => {
                    const stats = calculateStats?.(groupRows);
                    return (
                        <tbody key={title} className="divide-y divide-border">
                            {groupBy !== "all" && stats && renderGroupHeader && renderGroupHeader(title, stats, groupBy)}
                            {groupRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-muted/5 transition-colors border-b border-border/40 last:border-0 group/row">
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className="px-4 py-3 whitespace-nowrap">
                                            {col.render(row)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    );
                })}
            </table>
        </div>
    );
}

// Mobile table rendering
function MobileTable<T extends Record<string, any>>({
    mobileColumns,
    groupBy,
    sortedGroupEntries,
    calculateStats,
    renderMobileGroupHeader,
}: {
    mobileColumns: MobileColumnDef<T>[];
    groupBy: GroupingType;
    sortedGroupEntries: [string, T[]][];
    calculateStats?: (rows: T[]) => GroupStats;
    renderMobileGroupHeader?: (title: string, stats: GroupStats, groupBy: GroupingType) => ReactNode;
}) {
    return (
        <div className="sm:hidden">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="text-[10px] uppercase bg-muted/50 text-muted-foreground border-b border-border">
                    <tr>
                        {mobileColumns.map((col, idx) => (
                            <th key={idx} className="px-3 py-2 font-black">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                {sortedGroupEntries.map(([title, groupRows]) => {
                    const stats = calculateStats?.(groupRows);
                    return (
                        <tbody key={title} className="divide-y divide-border">
                            {groupBy !== "all" && stats && renderMobileGroupHeader && renderMobileGroupHeader(title, stats, groupBy)}
                            {groupRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-muted/5 transition-colors cursor-pointer border-b border-border/40">
                                    {mobileColumns.map((col, colIdx) => (
                                        <td key={colIdx} className="px-3 py-3 align-middle">
                                            {col.render(row)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    );
                })}
            </table>
        </div>
    );
}

export function MasterTable<T extends Record<string, any>>({
    rows = [],
    columns,
    mobileColumns,
    groupBy: initialGroupBy = "all",
    getGroupKey,
    calculateStats,
    renderGroupHeader,
    renderMobileGroupHeader,
    showGroupToggle = true,
}: MasterTableProps<T>) {
    const [groupBy, setGroupBy] = useState<GroupingType>(initialGroupBy);

    const groupedData = useMemo(() => {
        if (!rows || rows.length === 0) return null;
        if (groupBy === "all") return { "All": rows };

        const groups: Record<string, T[]> = {};
        rows.forEach((row) => {
            const key = getGroupKey?.(row, groupBy) || "";
            if (!groups[key]) groups[key] = [];
            groups[key].push(row);
        });

        return groups;
    }, [rows, groupBy, getGroupKey]);

    if (!groupedData) return null;

    const sortedGroupEntries = Object.entries(groupedData).sort((a, b) => b[0].localeCompare(a[0]));

    return (
        <div className="w-full space-y-4">
            {showGroupToggle && (
                <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border w-fit ml-auto">
                    <button onClick={() => setGroupBy("all")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${groupBy === "all" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                        All
                    </button>
                    <button onClick={() => setGroupBy("date")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${groupBy === "date" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                        Date
                    </button>
                    <button onClick={() => setGroupBy("week")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${groupBy === "week" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                        Week
                    </button>
                </div>
            )}

            <div className="w-full rounded-2xl border border-border shadow-md bg-card overflow-hidden">
                <DesktopTable columns={columns} groupBy={groupBy} sortedGroupEntries={sortedGroupEntries} calculateStats={calculateStats} renderGroupHeader={renderGroupHeader} />
                <MobileTable mobileColumns={mobileColumns} groupBy={groupBy} sortedGroupEntries={sortedGroupEntries} calculateStats={calculateStats} renderMobileGroupHeader={renderMobileGroupHeader} />
            </div>
        </div>
    );
}
