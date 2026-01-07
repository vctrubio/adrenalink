"use client";

import { ReactNode, createContext, useContext, useState, useCallback } from "react";
import type { StatItem } from "@/backend/RenderStats";

interface TablesController {
    stats: StatItem[];
    onStatsChange: (stats: StatItem[]) => void;
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
    const [stats, setStats] = useState<StatItem[]>([]);

    const handleStatsChange = useCallback((newStats: StatItem[]) => {
        setStats(newStats);
    }, []);

    const controller: TablesController = {
        stats,
        onStatsChange: handleStatsChange,
    };

    return (
        <TablesContext.Provider value={controller}>
            <div className="space-y-6 p-6">
                {children}
            </div>
        </TablesContext.Provider>
    );
}