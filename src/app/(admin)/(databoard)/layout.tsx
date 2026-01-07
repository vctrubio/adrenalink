"use client";

import { useState, ReactNode, useCallback } from "react";
import { DataboardLayout } from "@/src/components/layouts/DataboardLayout";
import type { DataboardFilterByDate, DataboardGroupByDate, DataboardActivityFilter, DataboardController } from "@/types/databoard";
import type { StatItem } from "@/src/components/ui/row";
import type { SortConfig } from "@/types/sort";
import { usePathname } from "next/navigation";

interface DataboardLayoutWrapperProps {
    children: ReactNode;
}

const ENTITY_ID_MAP: Record<string, string> = {
    students: "student",
    teachers: "teacher",
    bookings: "booking",
    packages: "schoolPackage",
    equipments: "equipment",
};

export default function DataboardLayoutWrapper({ children }: DataboardLayoutWrapperProps) {
    const [filter, setFilter] = useState<DataboardFilterByDate>("All");
    const [group, setGroup] = useState<DataboardGroupByDate | string>("All");
    const [activity, setActivity] = useState<DataboardActivityFilter>("All");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortConfig>({ field: null, direction: "desc" });
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedCount, setSelectedCount] = useState(0);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [stats, setStats] = useState<StatItem[]>([]);
    const pathname = usePathname();

    const pathSegments = pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    const entityId = ENTITY_ID_MAP[lastSegment] || lastSegment;

    const handleSelectionModeToggle = useCallback((enabled: boolean) => {
        setIsSelectionMode(enabled);
        if (!enabled) {
            setSelectedCount(0);
        }
    }, []);

    const handleAddClick = useCallback(() => {
        console.log("Add button clicked for:", lastSegment);
    }, [lastSegment]);

    const handleStatsChange = useCallback((newStats: StatItem[]) => {
        setStats(newStats);
    }, []);

    const controller: DataboardController = {
        stats,
        filter,
        onFilterChange: setFilter,
        group,
        onGroupChange: setGroup,
        activity,
        onActivityChange: setActivity,
        search,
        onSearchChange: setSearch,
        sort,
        onSortChange: setSort,
        isSelectionMode,
        onSelectionModeToggle: handleSelectionModeToggle,
        selectedCount,
        onAddClick: handleAddClick,
        counts,
        onCountsChange: setCounts,
        onStatsChange: handleStatsChange,
    };

    return (
        <DataboardLayout controller={controller} entityId={entityId} stats={stats}>
            {children}
        </DataboardLayout>
    );
}
