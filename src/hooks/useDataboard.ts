"use client";

import { useState } from "react";
import type { DataboardFilterByDate, DataboardGroupByDate } from "@/types/databoard";
import type { AbstractModel } from "@/backend/models/AbstractModel";

export interface DataboardGroup<T> {
    label: string;
    data: AbstractModel<T>[];
}

export const useDataboard = <T>(data: AbstractModel<T>[], searchFields: string[] = []) => {
    const [filter, setFilter] = useState<DataboardFilterByDate>("All");
    const [group, setGroup] = useState<DataboardGroupByDate>("All");
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [search, setSearch] = useState<string>("");

    const filterDataBySearch = (items: AbstractModel<T>[]): AbstractModel<T>[] => {
        if (!search || searchFields.length === 0) return items;

        const searchLower = search.toLowerCase();
        return items.filter(item => {
            return searchFields.some(field => {
                const value = item.schema[field as keyof typeof item.schema];
                if (value == null) return false;
                return String(value).toLowerCase().includes(searchLower);
            });
        });
    };

    const filterDataByDate = (items: AbstractModel<T>[]): AbstractModel<T>[] => {
        const now = new Date();
        const filterMap: Record<DataboardFilterByDate, number> = {
            "All": 0,
            "Last 7 days": 7,
            "Last 30 days": 30
        };

        const daysToFilter = filterMap[filter];
        if (daysToFilter === 0) return items;

        const cutoffDate = new Date(now.getTime() - daysToFilter * 24 * 60 * 60 * 1000);
        return items.filter(item => {
            const createdAt = item.schema.createdAt;
            return createdAt && new Date(createdAt) >= cutoffDate;
        });
    };

    const groupDataByDate = (items: AbstractModel<T>[]): DataboardGroup<T>[] => {
        if (group === "All") {
            return [{ label: "All", data: items }];
        }

        const groups = new Map<string, AbstractModel<T>[]>();

        items.forEach(item => {
            const createdAt = new Date(item.schema.createdAt);
            let key: string;

            if (group === "Daily") {
                key = createdAt.toLocaleDateString();
            } else if (group === "Weekly") {
                const weekStart = new Date(createdAt);
                weekStart.setDate(createdAt.getDate() - createdAt.getDay());
                key = `Week of ${weekStart.toLocaleDateString()}`;
            } else {
                key = `${createdAt.toLocaleString("default", { month: "long" })} ${createdAt.getFullYear()}`;
            }

            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(item);
        });

        return Array.from(groups.entries()).map(([label, data]) => ({ label, data }));
    };

    const searchedData = filterDataBySearch(data);
    const filteredData = filterDataByDate(searchedData);
    const groupedData = groupDataByDate(filteredData);

    return {
        filter,
        setFilter,
        group,
        setGroup,
        search,
        setSearch,
        expandedRow,
        setExpandedRow,
        groupedData
    };
};
