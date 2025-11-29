"use client";

import { useState, ReactNode } from "react";
import { DataboardLayout } from "@/src/components/layouts/DataboardLayout";
import { ENTITY_DATA } from "@/config/entities";
import type { DataboardFilterByDate, DataboardGroupByDate, DataboardController } from "@/types/databoard";
import { usePathname, useRouter } from "next/navigation";

interface DataboardLayoutWrapperProps {
    children: ReactNode;
}

export default function DataboardLayoutWrapper({ children }: DataboardLayoutWrapperProps) {
    const [filter, setFilter] = useState<DataboardFilterByDate>("All");
    const [group, setGroup] = useState<DataboardGroupByDate | string>("All");
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedCount, setSelectedCount] = useState(0);
    const pathname = usePathname();
    const router = useRouter();

    const pathSegments = pathname.split("/").filter(Boolean);

    // Check if this is a detail page (has ID in path)
    const lastSegment = pathSegments[pathSegments.length - 1];
    const isDetailPage = lastSegment !== "form" && pathSegments.length > 1 && !["students", "teachers", "bookings", "packages", "equipments", "events", "rentals", "referrals", "requests"].includes(lastSegment);

    // Only show navigation on list pages, not detail pages
    if (isDetailPage) {
        return children;
    }

    // Extract entity type from pathname
    const entitySegment = pathSegments[pathSegments.length - 1];

    // Map segment to entity id
    const entityIdMap: Record<string, string> = {
        "students": "student",
        "teachers": "teacher",
        "bookings": "booking",
        "packages": "schoolPackage",
        "equipments": "equipment",
        "events": "event",
        "rentals": "rental",
        "referrals": "referral",
        "requests": "studentPackage",
    };

    const entityId = entityIdMap[entitySegment];
    if (!entityId) {
        return children;
    }

    const entity = ENTITY_DATA.find((e) => e.id === entityId);
    if (!entity) {
        return children;
    }

    const handleSelectionModeToggle = (enabled: boolean) => {
        setIsSelectionMode(enabled);
        if (!enabled) {
            setSelectedCount(0);
        }
    };

    const handleAddClick = () => {
        router.push(`/${entitySegment}/form`);
    };

    const controller: DataboardController = {
        stats: [],
        totalCount: 0,
        filter,
        onFilterChange: setFilter,
        group,
        onGroupChange: setGroup,
        isSelectionMode,
        onSelectionModeToggle: handleSelectionModeToggle,
        selectedCount,
        onAddClick: handleAddClick,
    };

    return (
        <DataboardLayout controller={controller}>
            {children}
        </DataboardLayout>
    );
}
