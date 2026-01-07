"use client";

import { ReactNode, useEffect } from "react";
import { useTablesController } from "@/src/app/(admin)/(tables)/layout";
import type { TableStat } from "./TablesHeaderStats";

interface TablesPageClientProps {
    stats?: TableStat[];
    children: ReactNode;
}

export function TablesPageClient({ stats, children }: TablesPageClientProps) {
    const controller = useTablesController();

    // Sync local page stats to the global controller in the layout
    useEffect(() => {
        if (stats) {
            controller.onStatsChange(stats);
        }
    }, [stats, controller.onStatsChange]);

    return <div className="space-y-6">{children}</div>;
}
