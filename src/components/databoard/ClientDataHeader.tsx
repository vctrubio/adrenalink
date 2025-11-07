"use client";

import { ComponentType } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { DATABOARD_ENTITY_SEARCH_FIELDS } from "@/config/databoard";
import { useDataboard } from "@/src/hooks/useDataboard";
import { DataboardController } from "./DataboardController";
import { GroupDataRows } from "./GroupDataRows";
import type { AbstractModel } from "@/backend/models/AbstractModel";

interface ClientDataHeaderProps<T> {
    entityId: string;
    data: AbstractModel<T>[];
    rowComponent: ComponentType<{
        item: AbstractModel<T>;
        isExpanded: boolean;
        onToggle: (id: string) => void;
    }>;
}

export const ClientDataHeader = <T,>({ entityId, data, rowComponent: RowComponent }: ClientDataHeaderProps<T>) => {
    const searchFields = DATABOARD_ENTITY_SEARCH_FIELDS[entityId] || [];
    const { filter, setFilter, group, setGroup, search, setSearch, expandedRow, setExpandedRow, groupedData } = useDataboard(data, searchFields);

    const entity = ENTITY_DATA.find((e) => e.id === entityId)!;
    const Icon = entity.icon;
    const entityColor = entity.color;

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <DataboardController
                search={search}
                setSearch={setSearch}
                filter={filter}
                setFilter={setFilter}
                group={group}
                setGroup={setGroup}
                icon={<Icon className="w-6 h-6" />}
                entityColor={entityColor}
            />

            <div className="flex-1 space-y-6">
                <GroupDataRows
                    groupedData={groupedData}
                    renderRow={(item, isExpanded, onToggle) => <RowComponent key={item.schema.id} item={item} isExpanded={isExpanded} onToggle={onToggle} />}
                    expandedRow={expandedRow}
                    setExpandedRow={setExpandedRow}
                    entityId={entityId}
                    entityColor={entityColor}
                />
            </div>
        </div>
    );
};
