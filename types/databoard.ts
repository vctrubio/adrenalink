import type { ReactNode } from "react";
import type { StatItem } from "@/src/components/ui/row";

export type DataboardFilterByDate = "All" | "Last 7 days" | "Last 30 days" | "Active";

export type DataboardGroupByDate = "All" | "Daily" | "Weekly" | "Monthly";

export type DataboardActivityFilter = "All" | "Active" | "Inactive";

export interface DataboardController {
	stats: StatItem[];
	totalCount: number;
	filter: DataboardFilterByDate;
	onFilterChange: (value: DataboardFilterByDate) => void;
	group: DataboardGroupByDate | string;
	onGroupChange: (value: DataboardGroupByDate | string) => void;
	activity: DataboardActivityFilter;
	onActivityChange: (value: DataboardActivityFilter) => void;
	isSelectionMode: boolean;
	onSelectionModeToggle: (enabled: boolean) => void;
	selectedCount: number;
	onAddClick: () => void;
	isLoading?: boolean;
	counts: Record<string, number>;
	onCountsChange: (counts: Record<string, number>) => void;
}
