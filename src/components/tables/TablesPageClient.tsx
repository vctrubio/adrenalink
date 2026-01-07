"use client";

import { ReactNode, useEffect } from "react";
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

    // Sync local page stats to the global controller in the layout
    useEffect(() => {
        if (stats) {
            controller.onStatsChange(stats); 
        }
    }, [stats, controller.onStatsChange]);

    return (
        <div className="space-y-6">
            {/* Page Title & Description */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>
            
            {children}
        </div>
    );
}