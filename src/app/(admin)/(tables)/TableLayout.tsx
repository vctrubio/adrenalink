"use client";

import { ReactNode } from "react";
import { TablesNavigationRoutes } from "./TablesNavigationRoutes";
import { TablesHeaderStats } from "./TablesHeaderStats";
import type { TableStat } from "./TablesHeaderStats";

interface TableLayoutProps {
    children: ReactNode;
    stats: TableStat[];
}

export function TableLayout({ children, stats }: TableLayoutProps) {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header Row: Navigation (Left) + Stats (Right) */}
            <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
                <TablesNavigationRoutes />
                <TablesHeaderStats stats={stats} />
            </div>
            
            {children}
        </div>
    );
}
