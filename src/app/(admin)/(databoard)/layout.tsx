"use client";

import { useState, ReactNode } from "react";
import { DataboardLayout } from "@/src/components/layouts/DataboardLayout";
import { Breadcrumb } from "@/src/components/databoard/Breadcrumb";
import type { DataboardFilterByDate, DataboardGroupByDate, DataboardActivityFilter, DataboardController } from "@/types/databoard";
import { usePathname } from "next/navigation";

interface DataboardLayoutWrapperProps {
    children: ReactNode;
}

const DATABOARD_LIST_PAGES = ["students", "teachers", "bookings", "packages", "equipments"];

export default function DataboardLayoutWrapper({ children }: DataboardLayoutWrapperProps) {
    const [filter, setFilter] = useState<DataboardFilterByDate>("All");
    const [group, setGroup] = useState<DataboardGroupByDate | string>("All");
    const [activity, setActivity] = useState<DataboardActivityFilter>("All");
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedCount, setSelectedCount] = useState(0);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const pathname = usePathname();

    const pathSegments = pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];

    // Check if this is a list page
    const isListPage = DATABOARD_LIST_PAGES.includes(lastSegment);

    // Only show databoard layout on list pages, not detail pages
    if (!isListPage) {
        return (
            <>
                <div className="px-4 py-4 lg:px-8 lg:py-8">
                    <div className="max-w-7xl mx-auto">
                        <Breadcrumb />
                    </div>
                </div>
                {children}
            </>
        );
    }

    const handleSelectionModeToggle = (enabled: boolean) => {
        setIsSelectionMode(enabled);
        if (!enabled) {
            setSelectedCount(0);
        }
    };

    const handleAddClick = () => {
        // TODO: Open modal for adding new entity
        console.log("Add button clicked for:", lastSegment);
    };

    const controller: DataboardController = {
        stats: [],
        totalCount: 0,
        filter,
        onFilterChange: setFilter,
        group,
        onGroupChange: setGroup,
        activity,
        onActivityChange: setActivity,
        isSelectionMode,
        onSelectionModeToggle: handleSelectionModeToggle,
        selectedCount,
        onAddClick: handleAddClick,
        counts,
        onCountsChange: setCounts,
    };

    return (
        <DataboardLayout controller={controller}>
            {children}
        </DataboardLayout>
    );
}
