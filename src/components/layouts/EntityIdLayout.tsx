"use client";

import { useEffect, type ReactNode } from "react";
import { useTablesController } from "@/src/app/(admin)/(tables)/layout";
import type { StatItem } from "@/backend/RenderStats";

interface EntityIdLayoutProps {
    stats: StatItem[];
    leftColumn: ReactNode;
    rightColumn: ReactNode | null;
}

export function EntityIdLayout({ stats, leftColumn, rightColumn }: EntityIdLayoutProps) {
    const controller = useTablesController();

    useEffect(() => {
        controller.onStatsChange(stats);
    }, [stats, controller]);

    return (
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 space-y-6 lg:space-y-0">
            <div className="lg:col-span-4">
                <div className="sticky top-8">{leftColumn}</div>
            </div>
            <div className="lg:col-span-8">{rightColumn}</div>
        </div>
    );
}
