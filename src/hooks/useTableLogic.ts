import { useTablesController } from "@/src/app/(admin)/(tables)/layout";
import type { GroupingType } from "@/src/app/(admin)/(tables)/MasterTable";
import { useMemo } from "react";

interface UseTableLogicProps<T> {
    data: T[];
    filterSearch: (items: T[], search: string) => T[];
    filterStatus?: (item: T, status: string) => boolean;
    dateField?: keyof T | ((item: T) => string);
}

export function useTableLogic<T>({ data, filterSearch, filterStatus, dateField }: UseTableLogicProps<T>) {
    const { search, status, group } = useTablesController();

    // 1. Filter Data
    const filteredRows = useMemo(() => {
        let rows = filterSearch(data, search);
        
        if (filterStatus && status !== "All") {
            rows = rows.filter(item => filterStatus(item, status));
        }
        
        return rows;
    }, [data, search, status, filterSearch, filterStatus]);

    // 2. Map Grouping
    const masterTableGroupBy: GroupingType = 
        group === "Weekly" ? "week" : 
        group === "Monthly" ? "month" :
        "all";

    // 3. Generate Group Key
    const getGroupKey = (row: T, groupBy: GroupingType) => {
        if (groupBy === "all") return "";

        const dateStr = typeof dateField === 'function' ? dateField(row) : (row[dateField as keyof T] as unknown as string);
        if (!dateStr) return "";

        const date = new Date(dateStr);
        
        if (groupBy === "date") {
            return date.toISOString().split("T")[0];
        } else if (groupBy === "week") {
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            return `${date.getFullYear()}-W${weekNum}`;
        } else if (groupBy === "month") {
            return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        }
        return "";
    };

    return {
        filteredRows,
        masterTableGroupBy,
        getGroupKey
    };
}
