"use client";

import { ReactNode, createContext, useContext } from "react";
import type { DataboardController as DataboardControllerType } from "@/types/databoard";
import DataboardController from "@/src/app/(admin)/(databoard)/DataboardController";

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
}

export function DataboardLayout({ children, controller }: DataboardLayoutProps) {
    return (
        <DataboardContext.Provider value={controller}>
            {/* Mobile Layout */}
            <div className="lg:hidden">
                <div className="p-4 space-y-4">
                    <div className="bg-card p-6 space-y-6">
                        <DataboardController controller={controller} isMobile />
                    </div>
                    <div className="bg-card">
                        <div className="p-6">{children}</div>
                    </div>
                    <div className="h-24" />
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-12 gap-8">
                        {/* Controller Sidebar */}
                        <div className="col-span-4">
                            <div className="sticky top-8">
                                <div className="bg-card p-6 space-y-6">
                                    <DataboardController controller={controller} />
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="col-span-8">
                            <div className="space-y-6">{children}</div>
                        </div>
                    </div>
                </div>
            </div>
        </DataboardContext.Provider>
    );
}
