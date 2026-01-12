"use client";

import { usePathname } from "next/navigation";
import { ENTITY_DATA } from "@/config/entities";
import { SearchInput } from "@/src/components/SearchInput";
import { useTablesController } from "@/src/app/(admin)/(tables)/layout";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import type { DataboardFilterByDate, DataboardGroupByDate, DataboardActivityFilter } from "@/types/databoard";

const FILTER_OPTIONS_DEFAULT: DataboardFilterByDate[] = ["All", "Last 7 days", "Last 30 days"];
const GROUP_OPTIONS: DataboardGroupByDate[] = ["All", "Weekly", "Monthly"];

// Determine status options based on entity
const getStatusOptions = (entityId: string): DataboardActivityFilter[] => {
    if (entityId === "booking" || entityId === "schoolPackage") {
        return ["All", "Active", "Inactive"]; // Example mapping
    }
    return ["All", "Active", "Inactive"];
};

interface TablesSearchHeaderProps {
    entityId?: string;
}

export function TablesSearchHeader({ entityId }: TablesSearchHeaderProps) {
    const pathname = usePathname();
    const controller = useTablesController();

    // Determine which entity we are on - check prop first, then pathname
    const entity = ENTITY_DATA.find((e) => (entityId ? e.id === entityId : pathname.includes(e.link)));
    if (!entity) return null;

    const statusOptions = getStatusOptions(entity.id);

    return (
        <div className="flex flex-wrap items-center gap-3 max-w-7xl mx-auto">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
                <SearchInput
                    id="tables-search-input"
                    entityColor={entity.color}
                    value={controller.search}
                    onChange={(e) => controller.onSearchChange(e.target.value)}
                    placeholder={`Search ${entity.name.toLowerCase()}...`}
                />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <FilterDropdown
                    label="Status"
                    value={controller.status}
                    options={statusOptions}
                    onChange={(v) => controller.onStatusChange(v as DataboardActivityFilter)}
                    entityColor={entity.color}
                />

                {/* Only show Date Filter/Group for time-relevant entities */}
                {(entity.id === "booking" ||
                    entity.id === "event" ||
                    entity.id === "teacher" ||
                    entity.id === "equipment" ||
                    entity.id === "student" ||
                    entity.id === "schoolPackage") && (
                    <>
                        <FilterDropdown
                            label="Filter"
                            value={controller.filter}
                            options={FILTER_OPTIONS_DEFAULT}
                            onChange={(v) => controller.onFilterChange(v as DataboardFilterByDate)}
                            entityColor={entity.color}
                        />
                        <FilterDropdown
                            label="Group"
                            value={controller.group}
                            options={GROUP_OPTIONS}
                            onChange={(v) => controller.onGroupChange(v as DataboardGroupByDate)}
                            entityColor={entity.color}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
