"use client";

import { ReactNode } from "react";
import { DataboardNavigation } from "@/src/components/databoard/DataboardNavigation";
import { DataboardSidebar } from "@/src/components/databoard/DataboardSidebar";
import { DataboardProvider } from "@/src/contexts/DataboardContext";
import type { DataboardController } from "@/types/databoard";

interface DataboardLayoutProps {
    children: ReactNode;
    controller: DataboardController;
}

export function DataboardLayout({ children, controller }: DataboardLayoutProps) {
    return (
        <DataboardProvider controller={controller}>
            {/* Content Area */}
            <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto w-full space-y-6">{children}</div>
            </div>
        </DataboardProvider>
    );
}
