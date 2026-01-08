"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTablesController } from "@/src/app/(admin)/(tables)/layout";
import type { TableStat } from "./TablesHeaderStats";
import { TablesSearchHeader } from "./TablesSearchHeader";

interface TablesPageClientProps {
    title?: string;
    description?: string;
    stats?: TableStat[];
    children: ReactNode;
}

export function TablesPageClient({ stats, children }: TablesPageClientProps) {
    const controller = useTablesController();
    const pathname = usePathname();

    // Sync local page stats to the global controller in the layout
    useEffect(() => {
        if (stats) {
            controller.onStatsChange(stats);
        }
    }, [stats, controller.onStatsChange]);

    // Clear search on navigation
    useEffect(() => {
        controller.onSearchChange("");
    }, [pathname, controller.onSearchChange]);

    return (
        <div className="space-y-6">
            <TablesSearchHeader />
            {children}
        </div>
    );
}
