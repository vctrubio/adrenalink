import { type ReactNode } from "react";
import { RowStats, type StatItem } from "@/src/components/ui/row";
import type { AbstractModel } from "@/backend/models";

interface GroupDataRowsProps<T> {
    groupedData: Array<{
        label: string;
        data: AbstractModel<T>[];
    }>;
    renderRow: (item: AbstractModel<T>, isExpanded: boolean, onToggle: (id: string) => void) => ReactNode;
    expandedRow: string | null;
    setExpandedRow: (id: string | null) => void;
    statsConfig?: (data: AbstractModel<T>[]) => StatItem[];
    entityColor: string;
}

export const GroupDataRows = <T,>({ groupedData, renderRow, expandedRow, setExpandedRow, statsConfig, entityColor }: GroupDataRowsProps<T>) => {
    const handleToggle = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    return (
        <div className="space-y-6">
            {groupedData.map((group, groupIndex) => (
                <div key={groupIndex} className="flex flex-col gap:2 rounded-lg overflow-hidden border border-border ">
                    {/* Group Header */}
                    <div className="bg-muted/30 px-6 py-4 border-b border-border">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{group.label}</h3>
                            <div className="flex items-center gap-6">
                                {statsConfig && <RowStats stats={statsConfig(group.data)} entityColor={entityColor} />}
                            </div>
                        </div>
                    </div>

                    {/* Group Rows */}
                    <div className="flex flex-col gap-2">{group.data.map((item) => renderRow(item, expandedRow === item.schema.id, handleToggle))}</div>
                </div>
            ))}
        </div>
    );
};
