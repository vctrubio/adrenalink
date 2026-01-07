"use client";

import { ReactNode, createContext, useContext, useState, useCallback } from "react";
import type { TableStat } from "@/src/components/tables/TablesHeaderStats";
import { TableLayout } from "@/src/components/layouts/TableLayout";

interface TablesController {
    stats: TableStat[];
    onStatsChange: (stats: TableStat[]) => void;
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

    const handleStatsChange = useCallback((newStats: TableStat[]) => {
        setStats(newStats);
    }, []);

    const controller: TablesController = {
        stats,
        onStatsChange: handleStatsChange,
    };

    return (
        <TablesContext.Provider value={controller}>
            <div className="p-6">
                <TableLayout stats={stats}>
                    {children}
                </TableLayout>
            </div>
        </TablesContext.Provider>
    );
}
