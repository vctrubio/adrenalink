"use client";

import { useState, useEffect, ComponentType } from "react";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { RowStats, type StatItem } from "@/src/components/ui/row";
import type { AbstractModel } from "@/backend/models";

interface GroupDataRowsProps<T> {
    groupedData: {
        label: string;
        data: AbstractModel<T>[];
    }[];
    RowComponent: ComponentType<{ item: AbstractModel<T>; isExpanded: boolean; onToggle: (id: string) => void }>;
    expandedRow: string | null;
    setExpandedRow: (id: string | null) => void;
    entityId: string;
    entityColor: string;
    calculateStats?: (data: AbstractModel<T>[]) => StatItem[];
}

export const GroupDataRows = <T,>({ 
    groupedData, 
    RowComponent, 
    expandedRow, 
    setExpandedRow, 
    entityColor,
    calculateStats 
}: GroupDataRowsProps<T>) => {
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    useEffect(() => {
        setCollapsedGroups(new Set());
    }, [groupedData.length]);

    const handleToggle = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const toggleGroup = (label: string) => {
        setCollapsedGroups((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(label)) {
                newSet.delete(label);
            } else {
                newSet.add(label);
            }
            return newSet;
        });
    };

    return (
        <div className="space-y-6">
            {groupedData.map((group, groupIndex) => {
                const showHeader = group.label !== "All";
                const isGroupExpanded = !showHeader || !collapsedGroups.has(group.label);
                const groupStats = calculateStats ? calculateStats(group.data) : [];

                return (
                    <div
                        key={group.label || groupIndex}
                        className={`flex flex-col gap-2 rounded-lg ${showHeader ? "border border-border shadow-sm overflow-hidden" : ""}`}
                    >
                        {showHeader && (
                            <div
                                className={`px-6 py-4 cursor-pointer transition-colors bg-card hover:bg-muted/30 ${isGroupExpanded ? "border-b border-border" : ""}`}
                                onClick={() => toggleGroup(group.label)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="transition-transform duration-200"
                                            style={{ transform: isGroupExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                        >
                                            <AdranlinkIcon className="w-4 h-4 -translate-y-0.5" style={{ color: entityColor }} />
                                        </div>
                                        <h3 className="text-xl font-bold">{group.label}</h3>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <RowStats stats={groupStats} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {isGroupExpanded && (
                            <div className="flex flex-col gap-2">
                                {group.data.map((item) => (
                                    <RowComponent 
                                        key={item.schema.id} 
                                        item={item} 
                                        isExpanded={expandedRow === item.schema.id} 
                                        onToggle={handleToggle} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
