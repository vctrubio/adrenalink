"use client";

import { ReactNode } from "react";
import { DataboardProvider } from "@/src/contexts/DataboardContext";
import type { DataboardController as DataboardControllerType } from "@/types/databoard";
import DataboardController from "@/src/app/(admin)/(databoard)/DataboardController";

interface DataboardLayoutProps {
    children: ReactNode;
    controller: DataboardControllerType;
}

export function DataboardLayout({ children, controller }: DataboardLayoutProps) {
    return (
        <DataboardProvider controller={controller}>
            {/* Mobile Layout */}
            <div className="lg:hidden">
                <div className="p-4 space-y-4">
                    <DataboardController isMobile />
                    <div className="bg-card rounded-lg border border-border shadow-sm">
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
                            <DataboardController />
                        </div>

                        {/* Content */}
                        <div className="col-span-8">
                            <div className="space-y-6">{children}</div>
                        </div>
                    </div>
                </div>
            </div>
        </DataboardProvider>
    );
}
