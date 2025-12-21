"use client";

import { useLayoutEffect, useRef, useMemo } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { DATABOARD_ENTITY_SEARCH_FIELDS } from "@/config/databoard";
import { useDataboard } from "@/src/hooks/useDataboard";
import { useDataboardController } from "@/src/components/layouts/DataboardLayout";
import { GroupDataRows } from "./GroupDataRows";
import type { AbstractModel } from "@/backend/models/AbstractModel";
import type { StatItem } from "@/src/components/ui/row";

interface DataboardRowsSectionProps<T extends { id: string }> {
    entityId: string;
    data: AbstractModel<T>[];
    rowComponent: React.ComponentType<{
        item: AbstractModel<T>;
        isExpanded: boolean;
        onToggle: (id: string) => void;
    }>;
    calculateStats: (data: AbstractModel<T>[]) => StatItem[];
    schoolId?: string;
}

// Rows component for use in layouts

export const DataboardRowsSection = <T extends { id: string }>({
    entityId,
    data,
    rowComponent: RowComponent,
    calculateStats,
    schoolId,
}: DataboardRowsSectionProps<T>) => {
    const controller = useDataboardController();
    const searchFields = DATABOARD_ENTITY_SEARCH_FIELDS[entityId] || [];
    const prevStatsRef = useRef<StatItem[]>([]);

    const { expandedRow, setExpandedRow, groupedData } = useDataboard(
        data,
        searchFields,
        [],
        {},
        controller.filter,
        controller.onFilterChange,
        controller.group,
        controller.onGroupChange,
        controller.activity,
        entityId,
        schoolId,
    );

    // Calculate filtered data count - flatten all groups
    const filteredData = useMemo(() => {
        return groupedData.flatMap(group => group.data);
    }, [groupedData]);

    // Update count for this entity when filtered data changes
    useLayoutEffect(() => {
        if (controller.onCountsChange && controller.counts[entityId] !== filteredData.length) {
            controller.onCountsChange({
                ...controller.counts,
                [entityId]: filteredData.length,
            });
        }
    }, [filteredData.length, entityId, controller.onCountsChange, controller.counts]);

    // Update stats based on filtered data
    useLayoutEffect(() => {
        if (controller.onStatsChange) {
            const stats = calculateStats(filteredData);
            const hasChanged = JSON.stringify(stats) !== JSON.stringify(prevStatsRef.current);
            if (hasChanged) {
                prevStatsRef.current = stats;
                controller.onStatsChange(stats);
            }
        }
    }, [filteredData, calculateStats, controller.onStatsChange]);

    const entity = ENTITY_DATA.find((e) => e.id === entityId);

    if (!entity) {
        return null;
    }

    const entityColor = entity.color;

    return (
        <GroupDataRows
            groupedData={groupedData}
            renderRow={(item: AbstractModel<T>, isExpanded, onToggle) => {
                return <RowComponent key={item.schema.id} item={item} isExpanded={isExpanded} onToggle={onToggle} />;
            }}
            expandedRow={expandedRow}
            setExpandedRow={setExpandedRow}
            entityId={entityId}
            entityColor={entityColor}
        />
    );
};
