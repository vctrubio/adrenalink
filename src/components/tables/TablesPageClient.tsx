"use client";

import { ReactNode } from "react";
import { TablesHeaderStats, type TableStat } from "./TablesHeaderStats";
import { TablesNavigationRoutes } from "./TablesNavigationRoutes";

interface TablesPageClientProps {
    title: string;
    description: string;
    stats?: TableStat[];
    children: ReactNode;
}

export function TablesPageClient({ title, description, stats, children }: TablesPageClientProps) {
    return (
        <div className="space-y-6">
            {/* Header Row: Navigation (Left) + Stats (Right) */}
            <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
                <TablesNavigationRoutes />
                {stats && stats.length > 0 && (
                    <div className="flex-shrink-0">
                        <TablesHeaderStats stats={stats} />
                    </div>
                )}
            </div>

            {/* Page Title & Description */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>
            
            {children}
        </div>
    );
}
