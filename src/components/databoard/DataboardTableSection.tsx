"use client";

import { useLayoutEffect, useRef, useMemo, ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ENTITY_DATA } from "@/config/entities";
import { DATABOARD_ENTITY_SEARCH_FIELDS } from "@/config/databoard";
import { useDataboard } from "@/src/hooks/useDataboard";
import { useDataboardController } from "@/src/components/layouts/DataboardLayout";
import { WizardTable, type WizardColumn } from "@/src/components/ui/wizzard/WizardTable";
import { StatItem, RowStats } from "@/src/components/ui/row";
import { DataboardStats } from "./DataboardStats";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";
import type { AbstractModel } from "@/backend/models/AbstractModel";
import { RAINBOW_ENTITIES, RAINBOW_COLORS } from "@/config/rainbow-entities";
import { studentRenderers, calculateStudentGroupStats } from "./rows/StudentRow";
import { teacherRenderers, calculateTeacherGroupStats } from "./rows/TeacherRow";
import { bookingRenderers, calculateBookingGroupStats } from "./rows/BookingRow";
import { equipmentRenderers, calculateEquipmentGroupStats } from "./rows/EquipmentRow";
import { eventRenderers, calculateEventGroupStats } from "./rows/EventRow";
import { schoolPackageRenderers } from "./rows/SchoolPackageRow";

export interface TableRenderers<T> {
    renderEntity: (item: T) => ReactNode;
    renderStr: (item: T) => ReactNode;
    renderAction: (item: T) => ReactNode;
    renderStats: (item: T) => StatItem[];
    renderColor?: (item: T) => string;
}

const renderersMap: Record<string, TableRenderers<any>> = {
    student: studentRenderers,
    teacher: teacherRenderers,
    booking: bookingRenderers,
    equipment: equipmentRenderers,
    event: eventRenderers,
    schoolPackage: schoolPackageRenderers,
};

const statsMap: Record<string, (data: any[]) => StatItem[]> = {
    student: calculateStudentGroupStats,
    teacher: calculateTeacherGroupStats,
    booking: calculateBookingGroupStats,
    equipment: calculateEquipmentGroupStats,
    event: calculateEventGroupStats,
};

interface DataboardTableSectionProps<T> {
    entityId: string;
    data: AbstractModel<T>[];
    calculateStats: (data: AbstractModel<T>[]) => StatItem[];
}

export const DataboardTableSection = <T,>({
    entityId,
    data,
    calculateStats,
}: DataboardTableSectionProps<T>) => {
    const router = useRouter();
    const controller = useDataboardController();
    const entity = ENTITY_DATA.find((e) => e.id === entityId);
    const renderers = renderersMap[entityId];
    
    const searchFields = DATABOARD_ENTITY_SEARCH_FIELDS[entityId] || [];
    const prevStatsRef = useRef<StatItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

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

    // Calculate filtered data - flatten all groups
    const filteredData = useMemo(() => {
        return groupedData.flatMap(group => group.data);
    }, [groupedData]);

    // Calculate stats for all data and per group
    const statsData = useMemo(() => {
        const allStats = calculateStats(filteredData);
        const groupStatsMap: Record<string, StatItem[]> = {};
        groupedData.forEach(group => {
            groupStatsMap[group.label] = calculateStats(group.data);
        });
        return { allStats, groupStatsMap };
    }, [filteredData, groupedData, calculateStats]);

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
            const statsValues = statsData.allStats.map(s => ({ label: s.label, value: s.value, color: s.color }));
            const prevValues = prevStatsRef.current.map(s => ({ label: s.label, value: s.value, color: s.color }));
            const hasChanged = JSON.stringify(statsValues) !== JSON.stringify(prevValues);
            if (hasChanged) {
                prevStatsRef.current = statsData.allStats;
                controller.onStatsChange(statsData.allStats);
            }
        }
    }, [statsData.allStats, controller.onStatsChange]);

    // Clear search when entityId changes
    useEffect(() => {
        controller.onSearchChange("");
    }, [entityId]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const searchInput = document.getElementById("databoard-search-input");
            const isSearchFocused = document.activeElement === searchInput;

            // Cmd+. to focus search
            if ((e.metaKey || e.ctrlKey) && e.key === ".") {
                e.preventDefault();
                searchInput?.focus();
                setSelectedId(null);
                return;
            }

            // Enter in search: if exactly 1 result, navigate to it
            if (isSearchFocused && e.key === "Enter") {
                e.preventDefault();
                if (filteredData.length === 1) {
                    const resultId = filteredData[0].updateForm?.id;
                    if (resultId) {
                        const routeMap: Record<string, string> = {
                            schoolPackage: "packages",
                        };
                        const route = routeMap[entityId] || `${entityId}s`;
                        router.push(`/${route}/${resultId}`);
                    }
                }
                return;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [filteredData, selectedId, entityId]);

    // Early return after all hooks
    if (!entity) {
        return <div>Missing configuration for entity: {entityId}</div>;
    }

    const rainbowEntity = RAINBOW_ENTITIES.find(e => e.id === entityId);
    const accentColor = rainbowEntity ? RAINBOW_COLORS[rainbowEntity.shadeId].fill : entity.color;

    // Define columns for WizardTable
    const columns: WizardColumn<AbstractModel<T>>[] = [
        {
            id: "entity",
            header: entity.name,
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
            getRowId={(item) => item.updateForm?.id || ""}
            getRowAccentColor={(item) => renderers.renderColor?.(item) || accentColor}
            selectedId={selectedId || undefined}
            accentColor={accentColor}
            entityId={entityId}
            groupHeader={(label, count, isExpanded) => {
                return (
                    <div
                        className="flex items-center justify-between w-full cursor-pointer rounded-lg transition-all hover:bg-accent/10 dark:hover:bg-white/5"
                    >
                        <div className="flex items-center gap-3">
                            <ToggleAdranalinkIcon
                                isOpen={isExpanded}
                                color={accentColor}
                                className="ml-4"
                            />
                            <span className="font-bold">{label}</span>
                        </div>
                        <DataboardStats stats={statsData.groupStatsMap[label] || []} />
                    </div>
                );
            }}
        />
    );
};
