"use client";

import { useMemo, ReactNode, useState, useEffect } from "react";
import { useTablesController } from "@/src/app/(admin)/(tables)/layout";
import { SearchX } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { SEARCH_FIELDS_DESCRIPTION } from "@/types/searching-entities";
import { ENTITY_DATA } from "@/config/entities";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { PlusCircle, Trash2 } from "lucide-react";

export type GroupingType = "all" | "date" | "week" | "month";

export interface ColumnDef<T> {
    header: string;
    headerClassName?: string;
    className?: string;
    render: (row: T) => ReactNode;
}

export interface MobileColumnDef<T> {
    label: string;
    render: (row: T) => ReactNode;
    headerClassName?: string;
}

export type GroupStats = Record<string, any>;

/**
 * Shared actions for master tables
 */
export function TableActions({ id, type }: { id: string; type: "student" | "teacher" | "package" | "equipment" }) {
    const router = useRouter();

    const handleAddToRegister = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/register?add=${type}:${id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`DEV: calling soft delete on id ${id} entity ${type}`);
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleAddToRegister}
                title="Add to Register"
                className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors border border-primary/20 hover:border-primary/40 bg-primary/5"
            >
                <PlusCircle size={16} />
            </button>
            <button
                onClick={handleDelete}
                title="Delete"
                className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors border border-destructive/20 hover:border-destructive/40 bg-destructive/5"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}

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
    populateType?: "student" | "teacher" | "package" | "equipment";
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
                            <th key={idx} className={`${col.headerClassName || "px-2 py-3 font-medium"} ${col.className || ""}`}>
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
                                <tr
                                    key={idx}
                                    className="hover:bg-muted/5 transition-colors border-b border-border/40 last:border-0 group/row"
                                >
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className={`px-2 py-3 whitespace-nowrap ${col.className || ""}`}>
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
                            <th key={idx} className={col.headerClassName || "px-3 py-2 font-black"}>
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
    populateType,
}: MasterTableProps<T>) {
    const { search, onSearchChange } = useTablesController();
    
    const [groupBy, setGroupBy] = useState<GroupingType>(initialGroupBy || "all");
    const [isPopulating, setIsPopulating] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const credentials = useSchoolCredentials();

    // Sync state with prop if controlled
    useEffect(() => {
        if (initialGroupBy) {
            setGroupBy(initialGroupBy);
        }
    }, [initialGroupBy]);

    // Determine current entity for search hints
    const entity = ENTITY_DATA.find((e) => pathname.includes(e.link));
    const searchFields = entity ? SEARCH_FIELDS_DESCRIPTION[entity.id as keyof typeof SEARCH_FIELDS_DESCRIPTION] : [];

    const groupedData = useMemo(() => {
        if (!rows || rows.length === 0) return null;
        if (groupBy === "all") return { All: rows };

        const groups: Record<string, T[]> = {};
        rows.forEach((row) => {
            const key = getGroupKey?.(row, groupBy) || "";
            if (!groups[key]) groups[key] = [];
            groups[key].push(row);
        });

        return groups;
    }, [rows, groupBy, getGroupKey]);

    if (!groupedData || rows.length === 0) {
        return (
            <div className="w-full py-24 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-muted/30 rounded-full p-6 mb-6">
                    <SearchX size={48} className="text-muted-foreground/50" />
                </div>

                <h3 className="font-bold text-xl text-foreground mb-2">No results found</h3>

                {search ? (
                    <div className="space-y-6 max-w-md mx-auto">
                        <p className="text-muted-foreground">
                            We couldn&apos;t find any matches for{" "}
                            <span className="font-bold text-foreground">&quot;{search}&quot;</span>.
                        </p>

                        {searchFields && searchFields.length > 0 && (
                            <div className="text-xs text-muted-foreground/80 bg-muted/20 p-4 rounded-xl border border-border/40">
                                <span className="font-semibold block mb-2 uppercase tracking-wider text-[10px]">
                                    Try searching by:
                                </span>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {searchFields.map((field) => (
                                        <span
                                            key={field}
                                            className="px-2 py-1 bg-background rounded-md border border-border shadow-sm font-medium"
                                        >
                                            {field}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => onSearchChange("")}
                            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:opacity-90 transition-all active:scale-95"
                        >
                            Clear Search Filters
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <p className="text-muted-foreground">No data available to display.</p>
                        {populateType && (
                            <button
                                onClick={async () => {
                                    setIsPopulating(true);
                                    try {
                                        const response = await fetch("/api/beta", {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                            },
                                            body: JSON.stringify({ type: populateType, schoolId: credentials.id }),
                                        });

                                        if (!response.ok) {
                                            throw new Error("Failed to populate");
                                        }

                                        router.refresh();
                                    } catch (error) {
                                        console.error("Error populating:", error);
                                        setIsPopulating(false);
                                    }
                                }}
                                disabled={isPopulating}
                                className={`
                                    px-8 py-4 rounded-xl border transition-all duration-300 font-black uppercase tracking-tight
                                    ${
                                        isPopulating
                                            ? "bg-muted border-muted text-muted-foreground cursor-not-allowed"
                                            : "bg-primary border-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-lg"
                                    }
                                `}
                            >
                                {isPopulating ? "Populating..." : `Populate ${populateType.charAt(0).toUpperCase() + populateType.slice(1)}s`}
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    }

    const sortedGroupEntries = Object.entries(groupedData).sort((a, b) => b[0].localeCompare(a[0]));

    return (
        <div className="w-full space-y-4">
            {showGroupToggle && (
                <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border w-fit ml-auto">
                    <button
                        onClick={() => setGroupBy("all")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${groupBy === "all" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setGroupBy("date")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${groupBy === "date" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Date
                    </button>
                    <button
                        onClick={() => setGroupBy("week")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${groupBy === "week" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Week
                    </button>
                    <button
                        onClick={() => setGroupBy("month")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${groupBy === "month" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Month
                    </button>
                </div>
            )}

            <div className="w-full rounded-2xl border border-border shadow-md bg-card">
                <DesktopTable
                    columns={columns}
                    groupBy={groupBy}
                    sortedGroupEntries={sortedGroupEntries}
                    calculateStats={calculateStats}
                    renderGroupHeader={renderGroupHeader}
                />
                <MobileTable
                    mobileColumns={mobileColumns}
                    groupBy={groupBy}
                    sortedGroupEntries={sortedGroupEntries}
                    calculateStats={calculateStats}
                    renderMobileGroupHeader={renderMobileGroupHeader}
                />
            </div>
        </div>
    );
}
