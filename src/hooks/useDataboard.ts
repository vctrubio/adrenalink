"use client";

import { useState } from "react";
import type { DataboardFilterByDate, DataboardGroupByDate, DataboardActivityFilter } from "@/types/databoard";
import type { AbstractModel } from "@/backend/models/AbstractModel";

export interface DataboardGroup<T> {
    label: string;
    data: AbstractModel<T>[];
}

export const useDataboard = <T>(
    data: AbstractModel<T>[],
    searchFields: string[] = [],
    groupFields: string[] = [],
    filterFields: Record<string, string[]> = {},
    externalFilter?: DataboardFilterByDate,
    onExternalFilterChange?: (value: DataboardFilterByDate) => void,
    externalGroup?: DataboardGroupByDate | string,
    onExternalGroupChange?: (value: DataboardGroupByDate | string) => void,
    externalActivity?: DataboardActivityFilter
) => {
    // Use external state if provided, otherwise use local state
    const [localFilter, setLocalFilter] = useState<DataboardFilterByDate>("All");
    const [localGroup, setLocalGroup] = useState<DataboardGroupByDate | string>("All");

    const filter = externalFilter ?? localFilter;
    const setFilter = onExternalFilterChange ?? setLocalFilter;
    const group = externalGroup ?? localGroup;
    const setGroup = onExternalGroupChange ?? setLocalGroup;

    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [search, setSearch] = useState<string>("");
    const [entityFilter, setEntityFilter] = useState<Record<string, string>>({});
    const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedIds(newSelection);
    };

    const selectAll = () => {
        setSelectedIds(new Set(data.map((item) => item.schema.id)));
    };

    const deselectAll = () => {
        setSelectedIds(new Set());
    };

    const isSelected = (id: string) => selectedIds.has(id);

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

    const filterDataByEntity = (items: AbstractModel<T>[]): AbstractModel<T>[] => {
        if (Object.keys(entityFilter).length === 0) return items;

        return items.filter(item => {
            return Object.entries(entityFilter).every(([field, value]) => {
                if (!value) return true;
                const itemValue = item.schema[field as keyof typeof item.schema];
                return String(itemValue) === value;
            });
        });
    };

    const filterDataByActivity = (items: AbstractModel<T>[]): AbstractModel<T>[] => {
        if (!externalActivity || externalActivity === "All") return items;

        return items.filter(item => {
            const schema = item.schema as any;

            // Check for equipment status (special case)
            if (schema.status) {
                if (externalActivity === "Active") {
                    return schema.status !== "rip" && schema.status !== "sold";
                } else if (externalActivity === "Inactive") {
                    return schema.status === "rip" || schema.status === "sold";
                }
            }

            // Check for active boolean field
            if (typeof schema.active === "boolean") {
                if (externalActivity === "Active") {
                    return schema.active === true;
                } else if (externalActivity === "Inactive") {
                    return schema.active === false;
                }
            }

            // Check for schoolStudents relation (student activity)
            if (item.relations?.schoolStudents) {
                const schoolStudent = item.relations.schoolStudents[0];
                if (schoolStudent) {
                    if (externalActivity === "Active") {
                        return schoolStudent.active === true;
                    } else if (externalActivity === "Inactive") {
                        return schoolStudent.active === false;
                    }
                }
            }

            return true;
        });
    };

    const groupDataByDate = (items: AbstractModel<T>[]): DataboardGroup<T>[] => {
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
            } else if (group === "Monthly") {
                key = `${createdAt.toLocaleString("default", { month: "long" })} ${createdAt.getFullYear()}`;
            } else {
                key = "All";
            }

            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(item);
        });

        return Array.from(groups.entries()).map(([label, data]) => ({ label, data }));
    };

    const groupDataByField = (items: AbstractModel<T>[], field: string): DataboardGroup<T>[] => {
        const groups = new Map<string, AbstractModel<T>[]>();

        items.forEach(item => {
            const value = item.schema[field as keyof typeof item.schema];
            const key = value ? String(value) : "Unknown";

            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(item);
        });

        return Array.from(groups.entries()).map(([label, data]) => ({ label, data }));
    };

    const groupData = (items: AbstractModel<T>[]): DataboardGroup<T>[] => {
        if (group === "All") {
            return [{ label: "All", data: items }];
        }

        const isDateGroup = ["Daily", "Weekly", "Monthly"].includes(String(group));
        if (isDateGroup) {
            return groupDataByDate(items);
        }

        return groupDataByField(items, String(group));
    };

    const searchedData = filterDataBySearch(data);
    const filteredData = filterDataByDate(searchedData);
    const entityFilteredData = filterDataByEntity(filteredData);
    const activityFilteredData = filterDataByActivity(entityFilteredData);
    const groupedData = groupData(activityFilteredData);

    return {
        filter,
        setFilter,
        group,
        setGroup,
        search,
        setSearch,
        expandedRow,
        setExpandedRow,
        entityFilter,
        setEntityFilter,
        groupFields,
        filterFields,
        isSelectionMode,
        setIsSelectionMode,
        selectedIds,
        setSelectedIds,
        toggleSelection,
        selectAll,
        deselectAll,
        isSelected,
        groupedData
    };
};
