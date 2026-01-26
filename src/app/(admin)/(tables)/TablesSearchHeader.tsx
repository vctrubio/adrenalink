"use client";

import { usePathname } from "next/navigation";
import { ENTITY_DATA } from "@/config/entities";
import { SearchInput } from "@/src/components/SearchInput";
import { useTablesController } from "@/src/app/(admin)/(tables)/layout";
import { SortDropdown } from "@/src/components/ui/SortDropdown";
import { StatusFilterButtons } from "@/src/components/ui/StatusFilterButtons";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import { ENTITY_SORT_OPTIONS } from "@/types/sort";
import type { TableGroupByDate, TableActivityFilter } from "@/config/tables";
import type { SortConfig } from "@/types/sort";
import { Settings2 } from "lucide-react";

const GROUP_OPTIONS: TableGroupByDate[] = ["All", "Weekly", "Monthly"];

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
    if (entityId === "event") {
        return ["All", "Date", "Week", "Month"]; // Changed for event-specific date grouping toggles
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
    const showSortDropdown = entity.id === "booking" || entity.id === "event"; // Show sort dropdown for bookings and events

    // Render only the search input if entityId is "event", as per instruction.
    // Otherwise, render all controls.
    if (entity.id === "event") {
        return (
            <div className="flex flex-wrap items-center gap-3 max-w-7xl mx-auto">
                <div className="flex-1 min-w-[200px]">
                    <SearchInput
                        id="tables-search-input"
                        entityColor={entity.color}
                        value={controller.search}
                        onChange={(e) => controller.onSearchChange(e.target.value)}
                        placeholder="Search students or teachers..."
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-3 max-w-7xl mx-auto">
            {/* Search Input - always takes full width on small screens, flex-1 on larger */}
            <div className="flex-1 min-w-[200px]">
                <SearchInput
                    id="tables-search-input"
                    entityColor={entity.color}
                    value={controller.search}
                    onChange={(e) => controller.onSearchChange(e.target.value)}
                    placeholder={`Search ${entity.name.toLowerCase()}...`}
                />
            </div>

            {/* Right-aligned filters/grouping/status/actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 lg:gap-2">
                {/* Sort Dropdown (only for applicable entities) */}
                {showSortDropdown && (
                    <SortDropdown
                        value={controller.sort}
                        options={ENTITY_SORT_OPTIONS[entity.id as keyof typeof ENTITY_SORT_OPTIONS] || []}
                        onChange={controller.onSortChange}
                        entityColor={entity.color}
                    />
                )}

                {/* Group FilterDropdown */}
                {(entity.id === "event" || entity.id === "teacher" || entity.id === "student") && ( // Only show Group for time-relevant entities
                    <FilterDropdown
                        label="Group"
                        value={controller.group}
                        options={GROUP_OPTIONS}
                        onChange={(v) => controller.onGroupChange(v as TableGroupByDate)}
                        entityColor={entity.color}
                    />
                )}

                {/* Status/Date Filter Buttons */}
                {(entity.id === "student" ||
                    entity.id === "teacher" ||
                    entity.id === "booking" ||
                    entity.id === "schoolPackage" ||
                    entity.id === "equipment" ||
                    entity.id === "event") && ( // Show for events too
                    <StatusFilterButtons
                        options={statusOptions}
                        value={controller.status}
                        onChange={(v) => controller.onStatusChange(v as TableActivityFilter)}
                        entityColor={entity.color}
                    />
                )}

                {/* Actions Toggle */}
                {entity.id !== "event" && ( // Example: Not showing actions toggle for events, adjust as needed
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
                )}
            </div>
        </div>
    );
}