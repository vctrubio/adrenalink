"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { TablesNavigationRoutes } from "./TablesNavigationRoutes";
import { TablesHeaderStats } from "./TablesHeaderStats";
import { TablesSearchHeader } from "./TablesSearchHeader";
import { useTablesController } from "./layout";
import type { TableStat } from "./TablesHeaderStats";

interface TableLayoutProps {
    children: ReactNode;
    stats: TableStat[];
    showSearch?: boolean;
}

export function TableLayout({ children, stats, showSearch = true }: TableLayoutProps) {
    const controller = useTablesController();
    const pathname = usePathname();

    // Sync local page stats to the global controller in the layout
    useEffect(() => {
        if (stats) {
            controller.onStatsChange(stats);
        }
    }, [stats, controller]); // Removed controller.onStatsChange dependency to avoid potential loops if reference unstable, though it should be stable. Controller is stable.

    // Clear search on navigation
    useEffect(() => {
        controller.onSearchChange("");
    }, [pathname, controller]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header Row: Navigation (Left) + Stats (Right) */}
            <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
                <TablesNavigationRoutes />
                <TablesHeaderStats stats={stats} />
            </div>
            
            <div className="space-y-6">
                {showSearch && <TablesSearchHeader />}
                {children}
            </div>
        </div>
    );
}
