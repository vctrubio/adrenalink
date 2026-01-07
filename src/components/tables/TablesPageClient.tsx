"use client";

import { ReactNode, useEffect } from "react";
import { TablesHeaderStats } from "./TablesHeaderStats";
import { TablesNavigationRoutes } from "./TablesNavigationRoutes";
import { useTablesController } from "@/src/app/(admin)/(tables)/layout";
import type { TableStat } from "./TablesHeaderStats";

interface TablesPageClientProps {
    title: string;
    description: string;
    stats?: TableStat[];
    children: ReactNode;
}

export function TablesPageClient({ title, description, stats, children }: TablesPageClientProps) {
    const controller = useTablesController();

    // Sync local page stats to the global controller
    useEffect(() => {
        if (stats) {
            // Note: In a more complex app, we'd map TableStat to StatItem
            // but for now TablesHeaderStats is used locally or through controller.
            // If the layout header should show them, we use the controller.
            // The user wants Nav on Left and Stats on Right in one row.
            controller.onStatsChange(stats as any); 
        }
    }, [stats, controller.onStatsChange]);

    return (
        <div className="space-y-6">
            {/* Header Row: Navigation (Left) + Stats (Right) */}
            <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
                <TablesNavigationRoutes />
                {controller.stats && controller.stats.length > 0 && (
                    <div className="flex-shrink-0">
                        <TablesHeaderStats stats={controller.stats as any} />
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
