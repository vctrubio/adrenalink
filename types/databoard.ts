import type { ReactNode } from "react";
import type { StatItem } from "@/src/components/ui/row";
import type { SortConfig } from "./sort";

export type DataboardFilterByDate = "All" | "Last 7 days" | "Last 30 days" | "Active";

export type DataboardGroupByDate = "All" | "Daily" | "Weekly" | "Monthly";

export type EventActivityFilter = "All" | "Completed" | "Uncompleted";

export type DataboardActivityFilter = "All" | "Active" | "Inactive" | EventActivityFilter;

export interface DataboardController {
	stats: StatItem[];
	filter: DataboardFilterByDate;
	onFilterChange: (value: DataboardFilterByDate) => void;
	sort: SortConfig;
	onSortChange: (value: SortConfig) => void;
	group: DataboardGroupByDate | string;
	onGroupChange: (value: DataboardGroupByDate | string) => void;
	activity: DataboardActivityFilter;
	onActivityChange: (value: DataboardActivityFilter) => void;
	search: string;
	onSearchChange: (value: string) => void;
	isSelectionMode: boolean;
	onSelectionModeToggle: (enabled: boolean) => void;
	selectedCount: number;
	onAddClick: () => void;
	isLoading?: boolean;
	counts: Record<string, number>;
	onCountsChange: (counts: Record<string, number>) => void;
	onStatsChange?: (stats: StatItem[]) => void;
}
