"use client";

import { useState, ReactNode } from "react";
import { DataboardLayout } from "@/src/components/layouts/DataboardLayout";
import type { DataboardFilterByDate, DataboardGroupByDate, DataboardActivityFilter, DataboardController } from "@/types/databoard";
import type { StatItem } from "@/src/components/ui/row";
import { usePathname } from "next/navigation";

interface DataboardLayoutWrapperProps {
    children: ReactNode;
}

const DATABOARD_LIST_PAGES = ["students", "teachers", "bookings", "packages", "equipments", "events"];
const ENTITY_ID_MAP: Record<string, string> = {
    students: "student",
    teachers: "teacher",
    bookings: "booking",
    packages: "schoolPackage",
    equipments: "equipment",
    events: "event",
};

export default function DataboardLayoutWrapper({ children }: DataboardLayoutWrapperProps) {
    const [filter, setFilter] = useState<DataboardFilterByDate>("All");
    const [group, setGroup] = useState<DataboardGroupByDate | string>("All");
    const [activity, setActivity] = useState<DataboardActivityFilter>("All");
    const [search, setSearch] = useState("");
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedCount, setSelectedCount] = useState(0);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [stats, setStats] = useState<StatItem[]>([]);
    const pathname = usePathname();

    const pathSegments = pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    const entityId = ENTITY_ID_MAP[lastSegment] || lastSegment;


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
        stats,
        filter,
        onFilterChange: setFilter,
        group,
        onGroupChange: setGroup,
        activity,
        onActivityChange: setActivity,
        search,
        onSearchChange: setSearch,
        isSelectionMode,
        onSelectionModeToggle: handleSelectionModeToggle,
        selectedCount,
        onAddClick: handleAddClick,
        counts,
        onCountsChange: setCounts,
        onStatsChange: setStats,
    };

    return (
        <DataboardLayout controller={controller} entityId={entityId} stats={stats}>
            {children}
        </DataboardLayout>
    );
}
