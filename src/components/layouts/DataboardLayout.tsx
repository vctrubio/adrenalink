"use client";

import { ReactNode, createContext, useContext } from "react";
import type { DataboardController as DataboardControllerType } from "@/types/databoard";
import type { StatItem } from "@/src/components/ui/row";
import { DataboardSearchQueryHeader } from "@/src/components/databoard/DataboardSearchQueryHeader";
import { DataboardNavigationRoutes } from "@/src/components/databoard/DataboardNavigationRoutes";
import { DataboardHeaderStats } from "@/src/components/databoard/DataboardHeaderStats";

const DataboardContext = createContext<DataboardControllerType | null>(null);

export function useDataboardController() {
    const context = useContext(DataboardContext);
    if (!context) {
        throw new Error("useDataboardController must be used within DataboardLayout");
    }
    return context;
}

interface DataboardLayoutProps {
    children: ReactNode;
    controller: DataboardControllerType;
    entityId: string;
    stats: StatItem[];
}

export function DataboardLayout({ children, controller, entityId, stats }: DataboardLayoutProps) {
    const isLoading = stats.length === 0;

    return (
        <DataboardContext.Provider value={controller}>
            <div className="max-w-7xl mx-auto space-y-4">
                {/* Navigation + Stats Row */}
                <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
                    <DataboardNavigationRoutes />
                    <DataboardHeaderStats stats={stats} isLoading={isLoading} />
                </div>

                {/* Search + Filter Controls */}
                <DataboardSearchQueryHeader controller={controller} entityId={entityId} />
                {children}
            </div>
        </DataboardContext.Provider>
    );
}
