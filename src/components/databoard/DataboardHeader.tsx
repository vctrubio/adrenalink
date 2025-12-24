"use client";

import { ENTITY_DATA } from "@/config/entities";
import { EntityHeaderRow } from "./EntityHeaderRow";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import type { DataboardFilterByDate, DataboardGroupByDate, DataboardActivityFilter, DataboardController as DataboardControllerType } from "@/types/databoard";
import type { StatItem } from "@/src/components/ui/row";

const FILTER_OPTIONS_DEFAULT: DataboardFilterByDate[] = ["All", "Last 7 days", "Last 30 days"];
const FILTER_OPTIONS_EQUIPMENT: DataboardFilterByDate[] = ["All", "Last 7 days", "Last 30 days", "Active"];
const GROUP_OPTIONS: DataboardGroupByDate[] = ["All", "Daily", "Weekly", "Monthly"];
const getActivityOptions = (entityId: string) => {
    if (entityId === "event") {
        return ["All", "Completed", "Uncompleted"] as const;
    }
    return ["All", "Active", "Inactive"] as const;
};

interface DataboardHeaderProps {
    controller: DataboardControllerType;
    entityId: string;
    stats: StatItem[];
}

export function DataboardHeader({ controller, entityId, stats }: DataboardHeaderProps) {
    const entity = ENTITY_DATA.find((e) => e.id === entityId);
    if (!entity) return null;

    const filterOptions = entityId === "equipment" ? FILTER_OPTIONS_EQUIPMENT : FILTER_OPTIONS_DEFAULT;
    const isLoading = stats.length === 0;

    return (
        <div className="space-y-4">
            {/* Top Row: Icon + Name | Stats */}
            <EntityHeaderRow entityId={entityId} stats={stats} isLoading={isLoading} />

            {/* Search + Filter Controls */}
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none transition-all focus:bg-background"
                        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${entity.color}40`)}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <FilterDropdown label="Filter" value={controller.filter} options={filterOptions} onChange={(v) => controller.onFilterChange(v as DataboardFilterByDate)} entityColor={entity.color} />
                    <FilterDropdown label="Group" value={controller.group} options={GROUP_OPTIONS} onChange={controller.onGroupChange} entityColor={entity.color} />
                    <FilterDropdown label="Status" value={controller.activity} options={getActivityOptions(entityId)} onChange={(v) => controller.onActivityChange(v as DataboardActivityFilter)} entityColor={entity.color} />
                </div>
            </div>
        </div>
    );
}
