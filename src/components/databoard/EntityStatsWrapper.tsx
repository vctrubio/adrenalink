"use client";

import { useEffect, type ReactNode } from "react";
import { useDataboardController } from "@/src/components/layouts/DataboardLayout";
import type { StatItem } from "@/src/components/ui/row";

interface EntityStatsWrapperProps {
    stats: StatItem[];
    children: ReactNode;
}

export function EntityStatsWrapper({ stats, children }: EntityStatsWrapperProps) {
    const controller = useDataboardController();

    useEffect(() => {
        controller.onStatsChange(stats);
    }, [stats, controller.onStatsChange]);

    return <>{children}</>;
}
