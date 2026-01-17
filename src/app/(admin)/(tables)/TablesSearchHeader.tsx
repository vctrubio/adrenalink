"use client";

import { usePathname } from "next/navigation";
import { ENTITY_DATA } from "@/config/entities";
import { SearchInput } from "@/src/components/SearchInput";
import { useTablesController } from "@/src/app/(admin)/(tables)/layout";
import { SortDropdown } from "@/src/components/ui/SortDropdown";
import { StatusFilterButtons } from "@/src/components/ui/StatusFilterButtons";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import { ENTITY_SORT_OPTIONS } from "@/types/sort";
import type { DataboardGroupByDate, DataboardActivityFilter } from "@/types/databoard";
import type { SortConfig } from "@/types/sort";
import { Settings2 } from "lucide-react";

const GROUP_OPTIONS: DataboardGroupByDate[] = ["All", "Weekly", "Monthly"];

// Determine status options based on entity
const getStatusOptions = (entityId: string): string[] => {
    if (entityId === "student") {
        return ["All", "Ongoing", "Available", "New"];
    }
    if (entityId === "teacher") {
        return ["All", "Ongoing", "Free"];
    }
    if (entityId === "booking") {
        return ["All", "Ongoing", "Completed"];
    }
    if (entityId === "equipment") {
        return ["All", "Kite", "Wing", "Windsurf"];
    }
    if (entityId === "schoolPackage") {
        return ["All", "Lesson", "Rental"];
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
                {/* Use SortDropdown for event/booking entities */}
                {(entity.id === "event" || entity.id === "booking") && (
                    <SortDropdown
                        value={controller.sort}
                        options={ENTITY_SORT_OPTIONS.event || ENTITY_SORT_OPTIONS.booking || []}
                        onChange={controller.onSortChange}
                        entityColor={entity.color}
                    />
                )}

                {/* Only show Group for time-relevant entities */}
                {(entity.id === "booking" ||
                    entity.id === "event" ||
                    entity.id === "teacher" ||
                    entity.id === "student") && (
                    <FilterDropdown
                        label="Group"
                        value={controller.group}
                        options={GROUP_OPTIONS}
                        onChange={(v) => controller.onGroupChange(v as DataboardGroupByDate)}
                        entityColor={entity.color}
                    />
                )}

                {/* Status Filter Buttons for student, teacher, booking, package, equipment */}
                {(entity.id === "student" ||
                    entity.id === "teacher" ||
                    entity.id === "booking" ||
                    entity.id === "schoolPackage" ||
                    entity.id === "equipment") && (
                    <StatusFilterButtons
                        options={statusOptions}
                        value={controller.status}
                        onChange={(v) => controller.onStatusChange(v as DataboardActivityFilter)}
                    />
                )}

                {/* Actions Toggle */}
                <button
                    type="button"
                    onClick={() => controller.onShowActionsChange(!controller.showActions)}
                    className={`p-2 rounded-lg border transition-all ${
                        controller.showActions
                            ? "bg-primary/10 border-primary text-primary shadow-sm"
                            : "bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    title="Toggle Actions"
                >
                    <Settings2 size={16} />
                </button>
            </div>
        </div>
    );
}
