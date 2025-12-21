"use client";

import { useLayoutEffect } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { DATABOARD_ENTITY_SEARCH_FIELDS } from "@/config/databoard";
import { useDataboard } from "@/src/hooks/useDataboard";
import { useDataboardController } from "@/src/components/layouts/DataboardLayout";
import { GroupDataRows } from "./GroupDataRows";
import type { AbstractModel } from "@/backend/models/AbstractModel";

interface DataboardRowsSectionProps<T extends { id: string }> {
    entityId: string;
    data: AbstractModel<T>[];
        rowComponent: React.ComponentType<{
            item: AbstractModel<T>;
            isExpanded: boolean;
            onToggle: (id: string) => void;
        }>;
        dropdownComponent?: React.ComponentType<{ item: AbstractModel<T> }>;
    }
    
    // Rows component for use in layouts
    export const DataboardRowsSection = <T extends { id: string }>({
        entityId,
        data,
        rowComponent: RowComponent,
        dropdownComponent: DropdownComponent,
    }: DataboardRowsSectionProps<T>) => {
        const controller = useDataboardController();
        const searchFields = DATABOARD_ENTITY_SEARCH_FIELDS[entityId] || [];
        const { expandedRow, setExpandedRow, groupedData } = useDataboard(
            data,
            searchFields,
            [],
            {},
            controller.filter,
            controller.onFilterChange,
            controller.group,
            controller.onGroupChange,
            controller.activity
        );
        // Update count for this entity when data changes - use useLayoutEffect to update before paint
        useLayoutEffect(() => {
            if (controller.onCountsChange) {
                controller.onCountsChange({
                    ...controller.counts,
                    [entityId]: data.length,
                });
            }
        }, [data.length, entityId]);
    
        const entity = ENTITY_DATA.find((e) => e.id === entityId);
        
        if (!entity) {
            return null;
        }
    
        const entityColor = entity.color;
    
        return (
            <GroupDataRows
                            groupedData={groupedData}
                            renderRow={(item: AbstractModel<T>, isExpanded, onToggle) => {
                                return (
                                    <RowComponent
                                        key={item.schema.id}
                                        item={item}
                                        isExpanded={isExpanded}
                                        onToggle={onToggle}
                                        expandedContent={DropdownComponent ? <DropdownComponent item={item} /> : null}
                                    />
                                );
                            }}
                            expandedRow={expandedRow}
                            setExpandedRow={setExpandedRow}
                            entityId={entityId}
                            entityColor={entityColor}
                        />
                    );
                };
