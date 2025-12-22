import { useState } from "react";

type SortDirection = "asc" | "desc";

export function useTableSort<T extends string>(initialColumn: T | null = null) {
    const [sortColumn, setSortColumn] = useState<T | null>(initialColumn);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    const handleSort = (column: T) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    return {
        sortColumn,
        sortDirection,
        handleSort,
    };
}
