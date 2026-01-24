"use client";

import { ReactNode, createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import type { TableStat } from "./TablesHeaderStats";
import type { TableFilterByDate, TableGroupByDate, TableActivityFilter } from "@/config/tables";
import type { SortConfig } from "@/types/sort";

interface TablesController {
    stats: TableStat[];
    onStatsChange: (stats: TableStat[]) => void;
    search: string;
    onSearchChange: (value: string) => void;

    // New Filter/Group states
    filter: TableFilterByDate;
    onFilterChange: (value: TableFilterByDate) => void;
    group: TableGroupByDate;
    onGroupChange: (value: TableGroupByDate) => void;
    status: TableActivityFilter;
    onStatusChange: (value: TableActivityFilter) => void;
    sort: SortConfig;
    onSortChange: (value: SortConfig) => void;
    showActions: boolean;
    onShowActionsChange: (value: boolean) => void;
}

const TablesContext = createContext<TablesController | null>(null);

export function useTablesController() {
    const context = useContext(TablesContext);
    if (!context) {
        throw new Error("useTablesController must be used within TablesLayout");
    }
    return context;
}

export function TablesProvider({ children }: { children: ReactNode }) {
    const [stats, setStats] = useState<TableStat[]>([]);
    const [search, setSearch] = useState("");

    // New States
    const [filter, setFilter] = useState<TableFilterByDate>("All");
    const [group, setGroup] = useState<TableGroupByDate>("All");
    const [status, setStatus] = useState<TableActivityFilter>("All");
    const [sort, setSort] = useState<SortConfig>({ field: "date", direction: "desc" });
    const [showActions, setShowActions] = useState(false);

    const handleStatsChange = useCallback((newStats: TableStat[]) => {
        setStats(newStats);
    }, []);

    const controller: TablesController = useMemo(
        () => ({
            stats,
            onStatsChange: handleStatsChange,
            search,
            onSearchChange: setSearch,
            filter,
            onFilterChange: setFilter,
            group,
            onGroupChange: setGroup,
            status,
            onStatusChange: setStatus,
            sort,
            onSortChange: setSort,
            showActions,
            onShowActionsChange: setShowActions,
        }),
        [stats, search, filter, group, status, sort, showActions, handleStatsChange],
    );

    // Keyboard Shortcut for Search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === ".") {
                e.preventDefault();
                const searchInput = document.getElementById("tables-search-input");
                searchInput?.focus();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return <TablesContext.Provider value={controller}>{children}</TablesContext.Provider>;
}

export default function TablesLayout({ children }: { children: ReactNode }) {
    return <TablesProvider>{children}</TablesProvider>;
}
