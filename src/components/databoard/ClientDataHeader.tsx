"use client";

import { ENTITY_DATA } from "@/config/entities";
import { DATABOARD_ENTITY_SEARCH_FIELDS } from "@/config/databoard";
import { useDataboard } from "@/src/hooks/useDataboard";
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
}

// Rows component for use in layouts
export const DataboardRowsSection = <T extends { id: string }>({ entityId, data, rowComponent: RowComponent }: DataboardRowsSectionProps<T>) => {
    const searchFields = DATABOARD_ENTITY_SEARCH_FIELDS[entityId] || [];
    const { expandedRow, setExpandedRow, groupedData } = useDataboard(data, searchFields);

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
