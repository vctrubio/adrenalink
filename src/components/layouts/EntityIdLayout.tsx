"use client";

import { useEffect, type ReactNode } from "react";
import { useDataboardController } from "@/src/components/layouts/DataboardLayout";
import type { StatItem } from "@/src/components/ui/row";

interface EntityIdLayoutProps {
    stats: StatItem[];
    leftColumn: ReactNode;
    rightColumn: ReactNode | null;
}

export function EntityIdLayout({ stats, leftColumn, rightColumn }: EntityIdLayoutProps) {
    const controller = useDataboardController();

    useEffect(() => {
        controller.onStatsChange(stats);
    }, [stats, controller.onStatsChange]);

    return (
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 space-y-6 lg:space-y-0">
            <div className="lg:col-span-4">
                <div className="sticky top-8">
                    {leftColumn}
                </div>
            </div>
            <div className="lg:col-span-8">
                {rightColumn}
            </div>
        </div>
    );
}

