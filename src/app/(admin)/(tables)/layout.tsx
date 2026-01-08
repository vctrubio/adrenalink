"use client";

import { ReactNode, createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import type { TableStat } from "./TablesHeaderStats";
import { TableLayout } from "./TableLayout";

interface TablesController {
    stats: TableStat[];
    onStatsChange: (stats: TableStat[]) => void;
    search: string;
    onSearchChange: (value: string) => void;
}

const TablesContext = createContext<TablesController | null>(null);

export function useTablesController() {
    const context = useContext(TablesContext);
    if (!context) {
        throw new Error("useTablesController must be used within TablesLayout");
    }
    return context;
}

export default function TablesLayout({ children }: { children: ReactNode }) {
    const [stats, setStats] = useState<TableStat[]>([]);
    const [search, setSearch] = useState("");

    const handleStatsChange = useCallback((newStats: TableStat[]) => {
        setStats(newStats);
    }, []);

    const controller: TablesController = useMemo(
        () => ({
            stats,
            onStatsChange: handleStatsChange,
            search,
            onSearchChange: setSearch,
        }),
        [stats, search, handleStatsChange],
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

    return (
        <TablesContext.Provider value={controller}>
            <TableLayout stats={stats}>{children}</TableLayout>
        </TablesContext.Provider>
    );
}
