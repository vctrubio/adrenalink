"use client";

import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import { SortDropdown } from "@/src/components/ui/SortDropdown";
import { SearchInput } from "@/src/components/SearchInput";
import { ENTITY_DATA } from "@/config/entities";
import { EVENT_STATUS_CONFIG, type EventStatus } from "@/types/status";
import type { SortConfig, SortOption } from "@/types/sort";

export type EventStatusFilter = "all" | EventStatus | string;

interface TimelineHeaderProps {
    search: string;
    onSearchChange: (value: string) => void;
    sort: SortConfig;
    onSortChange: (config: SortConfig) => void;
    filter: EventStatusFilter;
    onFilterChange: (value: EventStatusFilter) => void;
    searchPlaceholder?: string;
    sortOptions?: SortOption[];
    filterOptions?: readonly string[];
}

const DEFAULT_SORT_OPTIONS: SortOption[] = [
    { field: "date", direction: "desc", label: "Newest" },
    { field: "date", direction: "asc", label: "Oldest" },
];

const DEFAULT_FILTER_OPTIONS = ["All", "Planned", "Tbc", "Completed", "Uncompleted"] as const;
const DEFAULT_FILTER_MAP: Record<string, EventStatusFilter> = {
    "All": "all",
    "Planned": "planned",
    "Tbc": "tbc",
    "Completed": "completed",
    "Uncompleted": "uncompleted"
};

export function TimelineHeader({
    search,
    onSearchChange,
    sort,
    onSortChange,
    filter,
    onFilterChange,
    searchPlaceholder = "Search students or teachers...",
    sortOptions = DEFAULT_SORT_OPTIONS,
    filterOptions = DEFAULT_FILTER_OPTIONS,
}: TimelineHeaderProps) {
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event");
    const defaultColor = eventEntity?.color || "#000000";

    const currentColor = "#000000";

    const handleFilterChange = (val: string) => {
        if (filterOptions === DEFAULT_FILTER_OPTIONS) {
            onFilterChange(DEFAULT_FILTER_MAP[val] || val.toLowerCase());
        } else {
            onFilterChange(val.toLowerCase());
        }
    };

    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                    <SearchInput
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        entityColor={defaultColor}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <SortDropdown
                        value={sort}
                        options={sortOptions}
                        onChange={onSortChange}
                        entityColor={currentColor}
                        toggleMode={true}
                    />
                    <FilterDropdown
                        label="Status"
                        value={filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                        options={filterOptions}
                        onChange={handleFilterChange}
                        entityColor={currentColor}
                    />
                </div>
            </div>
        </div>
    );
}
