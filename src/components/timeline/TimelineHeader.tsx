"use client";

import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import { SortDropdown } from "@/src/components/ui/SortDropdown";
import { SearchInput } from "@/src/components/SearchInput";
import { ENTITY_DATA } from "@/config/entities";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { TrendingUp } from "lucide-react";
import { getHMDuration } from "@/getters/duration-getter";
import { EVENT_STATUS_CONFIG, type EventStatus } from "@/types/status";
import type { TimelineStats } from "@/types/timeline-stats";
import type { SortConfig, SortOption } from "@/types/sort";

export type EventStatusFilter = "all" | EventStatus | string;

interface TimelineHeaderProps {
    search: string;
    onSearchChange: (value: string) => void;
    sort: SortConfig;
    onSortChange: (config: SortConfig) => void;
    filter: EventStatusFilter;
    onFilterChange: (value: EventStatusFilter) => void;
    stats: TimelineStats;
    currency: string;
    formatCurrency: (num: number) => string;
    showFinancials?: boolean;
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

import { Wallet } from "lucide-react";

// ... (existing imports and types)

export function TimelineHeader({
    search,
    onSearchChange,
    sort,
    onSortChange,
    filter,
    onFilterChange,
    stats,
    currency,
    formatCurrency,
    showFinancials = true,
    searchPlaceholder = "Search students or teachers...",
    sortOptions = DEFAULT_SORT_OPTIONS,
    filterOptions = DEFAULT_FILTER_OPTIONS,
}: TimelineHeaderProps) {
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event");
    const defaultColor = eventEntity?.color || "#000000";
    
    // User requested "all should be in black" for the filter
    const currentColor = "#000000";

    const hasPackageStats = stats.packageCount !== undefined;
    const hasBookingStats = stats.bookingCount !== undefined;

    const handleFilterChange = (val: string) => {
        // If using default options, map them. Otherwise pass value lowercase or as is.
        if (filterOptions === DEFAULT_FILTER_OPTIONS) {
            onFilterChange(DEFAULT_FILTER_MAP[val] || val.toLowerCase());
        } else {
            onFilterChange(val.toLowerCase());
        }
    };

    return (
        <div className="flex flex-col gap-4 mb-6">
            {/* Combined Controls and Stats Row */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                    <SearchInput
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        entityColor={defaultColor}
                    />
                </div>

                {/* Sort & Filter */}
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

                {/* Stats - Right aligned on desktop */}
                <div className="flex items-center gap-4 text-sm bg-muted/30 px-4 py-2 rounded-xl border border-border ml-auto">
                    {hasPackageStats ? (
                        <>
                            <div className="flex items-center gap-1.5 text-foreground font-bold">
                                <span className="text-muted-foreground font-normal">Requests:</span>
                                <span>{stats.packageCount}</span>
                            </div>
                            {(stats.packagePending || 0) > 0 && (
                                <div className="flex items-center gap-1.5 border-l border-border/50 pl-4">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="font-bold text-amber-600 dark:text-amber-400">{stats.packagePending}</span>
                                </div>
                            )}
                            {(stats.packageAccepted || 0) > 0 && (
                                <div className="flex items-center gap-1.5 border-l border-border/50 pl-4">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="font-bold text-green-600 dark:text-green-400">{stats.packageAccepted}</span>
                                </div>
                            )}
                            {(stats.packageRejected || 0) > 0 && (
                                <div className="flex items-center gap-1.5 border-l border-border/50 pl-4">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="font-bold text-red-600 dark:text-red-400">{stats.packageRejected}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-foreground font-bold border-l border-border/50 pl-4">
                                <div className="text-orange-600 dark:text-orange-400">
                                    <Wallet size={14} />
                                </div>
                                <span className="text-orange-600 dark:text-orange-400">
                                    {formatCurrency(Math.round((stats.packageTotalNet || 0) * 100) / 100)}
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            {hasBookingStats && (
                                <div className="flex items-center gap-1.5 text-foreground font-bold border-r border-border/50 pr-4 mr-4">
                                    <span className="text-muted-foreground font-normal">Bookings:</span>
                                    <span>{stats.bookingCount}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-foreground font-bold">
                                <FlagIcon size={14} className="text-muted-foreground" />
                                <span>{stats.eventCount}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-foreground font-bold border-l border-border/50 pl-4">
                                <DurationIcon size={14} className="text-muted-foreground" />
                                <span>{getHMDuration(stats.totalDuration)}</span>
                            </div>
                            {showFinancials && (
                                <>
                                    <div className="flex items-center gap-1.5 text-foreground font-bold border-l border-border/50 pl-4">
                                        <div className="text-green-600 dark:text-green-400">
                                            <HandshakeIcon size={14} />
                                        </div>
                                        <span className="text-green-600 dark:text-green-400">
                                            {formatCurrency(Math.round(stats.totalCommission * 100) / 100)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-foreground font-bold border-l border-border/50 pl-4">
                                        <div className="text-orange-600 dark:text-orange-400">
                                            <TrendingUp size={14} />
                                        </div>
                                        <span className="text-orange-600 dark:text-orange-400">
                                            {formatCurrency(Math.round(stats.totalRevenue * 100) / 100)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
