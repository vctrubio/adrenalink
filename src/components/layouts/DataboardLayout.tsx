"use client";

import { ReactNode, createContext, useContext } from "react";
import type { DataboardController as DataboardControllerType } from "@/types/databoard";
import type { StatItem } from "@/src/components/ui/row";
import { DataboardHeader } from "@/src/components/databoard/DataboardHeader";

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
    return (
        <DataboardContext.Provider value={controller}>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="space-y-4">
                        <DataboardHeader controller={controller} entityId={entityId} stats={stats} />
                    </div>

                    <div className="space-y-6">{children}</div>
                </div>
            </div>
        </DataboardContext.Provider>
    );
}
