import type { ReactNode } from "react";
import type { StatItem } from "@/src/components/ui/row";

export type DataboardFilterByDate = "All" | "Last 7 days" | "Last 30 days";

export type DataboardGroupByDate = "All" | "Daily" | "Weekly" | "Monthly";

export interface DataboardController {
	stats: StatItem[];
	totalCount: number;
	filter: DataboardFilterByDate;
	onFilterChange: (value: DataboardFilterByDate) => void;
	group: DataboardGroupByDate | string;
	onGroupChange: (value: DataboardGroupByDate | string) => void;
	isSelectionMode: boolean;
	onSelectionModeToggle: (enabled: boolean) => void;
	selectedCount: number;
	onAddClick: () => void;
	isLoading?: boolean;
}
