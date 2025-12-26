"use client";

import { useLayoutEffect, useRef, useMemo, ReactNode } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { DATABOARD_ENTITY_SEARCH_FIELDS } from "@/config/databoard";
import { useDataboard } from "@/src/hooks/useDataboard";
import { useDataboardController } from "@/src/components/layouts/DataboardLayout";
import { WizardTable, type WizardColumn } from "@/src/components/ui/wizzard/WizardTable";
import { StatItem, RowStats } from "@/src/components/ui/row";
import type { AbstractModel } from "@/backend/models/AbstractModel";
import { RAINBOW_ENTITIES, RAINBOW_COLORS } from "@/config/rainbow-entities";

export interface TableRenderers<T> {
    renderEntity: (item: T) => ReactNode;
    renderStr: (item: T) => ReactNode;
    renderAction: (item: T) => ReactNode;
    renderStats: (item: T) => StatItem[];
    renderColor?: (item: T) => string;
}

interface DataboardTableSectionProps<T extends { id: string }> {
    entityId: string;
    data: AbstractModel<T>[];
    renderers: TableRenderers<AbstractModel<T>>;
    calculateStats: (data: AbstractModel<T>[]) => StatItem[];
}

export const DataboardTableSection = <T extends { id: string }>({
    entityId,
    data,
    renderers,
    calculateStats,
}: DataboardTableSectionProps<T>) => {
    const controller = useDataboardController();
    const searchFields = DATABOARD_ENTITY_SEARCH_FIELDS[entityId] || [];
    const prevStatsRef = useRef<StatItem[]>([]);

    const { groupedData } = useDataboard(
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
        controller.search,
        controller.onSearchChange,
        controller.sort,
        controller.onSortChange,
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
    if (!entity) return null;

    const rainbowEntity = RAINBOW_ENTITIES.find(e => e.id === entityId);
    const accentColor = rainbowEntity ? RAINBOW_COLORS[rainbowEntity.shadeId].fill : entity.color;

    // Define columns for WizardTable
    const columns: WizardColumn<AbstractModel<T>>[] = [
        {
            id: "entity",
            header: "Entity",
            cell: (item) => renderers.renderEntity(item),
            width: "2fr",
        },
        {
            id: "str",
            header: "Info",
            cell: (item) => renderers.renderStr(item),
            width: "2fr",
        },
        {
            id: "actions",
            header: "Actions",
            cell: (item) => renderers.renderAction(item),
            width: "1.5fr",
            align: "right",
        },
        {
            id: "stats",
            header: "Stats",
            cell: (item) => <RowStats stats={renderers.renderStats(item)} />,
            width: "1.5fr",
            align: "right",
        },
    ];

    // Prepare data for WizardTable (flattened but tracking groups if needed)
    // WizardTable supports internal grouping via 'groupBy' prop if we pass a flat list
    // OR we can map our 'groupedData' structure.
    // 'groupedData' is { label: string, data: T[] }[]
    // To use WizardTable's groupBy, we need to flatten and attach the label.
    // But groupedData is already grouped.
    // Let's adapt groupedData to WizardTable.
    
    // Actually WizardTable takes `data` and optional `groupBy`. 
    // If I pass flattened data and a groupBy function, it re-groups.
    // But `groupedData` from `useDataboard` already does complex grouping logic.
    // So I should probably just iterate over `groupedData` and render multiple tables or
    // modify WizardTable to accept pre-grouped data.
    
    // For now, let's just flatten and use the group label as the key.
    const flatDataWithGroups = useMemo(() => {
        return groupedData.flatMap(group => 
            group.data.map(item => Object.assign(item, { __groupLabel: group.label }))
        );
    }, [groupedData]);

    return (
        <WizardTable
            data={flatDataWithGroups}
            columns={columns}
            groupBy={(item: any) => item.__groupLabel}
            getRowId={(item) => item.updateForm.id}
            getRowAccentColor={(item) => renderers.renderColor?.(item) || accentColor}
            accentColor={accentColor}
            groupHeader={(label, count) => (
                <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                     <span className="font-bold">{label}</span>
                     <span className="text-muted-foreground text-xs">({count})</span>
                     {/* We could add group stats here if we want */}
                </div>
            )}
        />
    );
};
