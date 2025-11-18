"use client";

import { useState, ReactNode } from "react";
import { DataboardLayout } from "@/src/components/layouts/DataboardLayout";
import { DataboardController } from "@/src/components/databoard/DataboardController";
import { ENTITY_DATA } from "@/config/entities";
import type { DataboardFilterByDate, DataboardGroupByDate } from "@/types/databoard";
import { usePathname } from "next/navigation";

interface DataboardLayoutWrapperProps {
    children: ReactNode;
}

export default function DataboardLayoutWrapper({ children }: DataboardLayoutWrapperProps) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<DataboardFilterByDate>("All");
    const [group, setGroup] = useState<DataboardGroupByDate>("All");
    const pathname = usePathname();

    const pathSegments = pathname.split("/").filter(Boolean);

    // Check if this is a detail page (has ID in path)
    const lastSegment = pathSegments[pathSegments.length - 1];
    const isDetailPage = lastSegment !== "form" && pathSegments.length > 1 && !["students", "teachers", "bookings", "packages", "equipments", "rentals", "referrals", "requests"].includes(lastSegment);

    // Only show controller on list pages, not detail pages
    if (isDetailPage) {
        return children;
    }

    // Extract entity type from pathname (e.g., /students -> students)
    const entitySegment = pathSegments[pathSegments.length - 1];

    // Map segment to entity id (handle plural forms)
    const entityIdMap: Record<string, string> = {
        "students": "student",
        "teachers": "teacher",
        "bookings": "booking",
        "packages": "schoolPackage",
        "equipments": "equipment",
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

    const controller = (
        <DataboardController
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            group={group}
            setGroup={setGroup}
            icon={<entity.icon />}
            entityColor={entity.color}
        />
    );

    return (
        <DataboardLayout controller={controller}>
            {children}
        </DataboardLayout>
    );
}
