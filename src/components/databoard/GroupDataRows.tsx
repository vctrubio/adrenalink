import { type ReactNode, useState } from "react";
import { RowStats, type StatItem } from "@/src/components/ui/row";
import type { AbstractModel } from "@/backend/models";
import { calculateStudentGroupStats, calculateTeacherGroupStats, calculateBookingGroupStats } from "@/src/components/databoard/rows";
import type { StudentModel, TeacherModel, BookingModel } from "@/backend/models";

interface GroupDataRowsProps<T> {
    groupedData: Array<{
        label: string;
        data: AbstractModel<T>[];
    }>;
    renderRow: (item: AbstractModel<T>, isExpanded: boolean, onToggle: (id: string) => void) => ReactNode;
    expandedRow: string | null;
    setExpandedRow: (id: string | null) => void;
    entityId: string;
    entityColor: string;
}

export const GroupDataRows = <T,>({ groupedData, renderRow, expandedRow, setExpandedRow, entityId, entityColor }: GroupDataRowsProps<T>) => {
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set(groupedData.map((_, index) => index)));

    const handleToggle = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const toggleGroup = (groupIndex: number) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupIndex)) {
                newSet.delete(groupIndex);
            } else {
                newSet.add(groupIndex);
            }
            return newSet;
        });
    };

    const getGroupStats = (data: AbstractModel<T>[]): StatItem[] => {
        if (entityId === "student") {
            return calculateStudentGroupStats(data as StudentModel[]);
        } else if (entityId === "teacher") {
            return calculateTeacherGroupStats(data as TeacherModel[]);
        } else if (entityId === "booking") {
            return calculateBookingGroupStats(data as BookingModel[]);
        }
        return [];
    };

    return (
        <div className="space-y-6">
            {groupedData.map((group, groupIndex) => {
                const isGroupExpanded = expandedGroups.has(groupIndex);
                return (
                    <div key={groupIndex} className="flex flex-col gap-2 rounded-lg overflow-hidden border border-border">
                        {/* Group Header */}
                        <div
                            className="bg-muted/30 px-6 py-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => toggleGroup(groupIndex)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <svg
                                        className={`w-5 h-5 transition-transform ${isGroupExpanded ? "rotate-90" : ""}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    <h3 className="text-lg font-semibold">{group.label}</h3>
                                </div>
                                <div className="flex items-center gap-6">
                                    <RowStats stats={getGroupStats(group.data)} />
                                </div>
                            </div>
                        </div>

                        {/* Group Rows */}
                        {isGroupExpanded && (
                            <div className="flex flex-col gap-2">{group.data.map((item) => renderRow(item, expandedRow === item.schema.id, handleToggle))}</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
