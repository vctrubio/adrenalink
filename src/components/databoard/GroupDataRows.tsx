"use client";

import { type ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { RowStats, type StatItem } from "@/src/components/ui/row";
import type { AbstractModel } from "@/backend/models";
import { calculateStudentGroupStats, calculateTeacherGroupStats, calculateBookingGroupStats, calculateEventGroupStats } from "@/src/components/databoard/rows";
import type { StudentModel, TeacherModel, BookingModel, EventModel } from "@/backend/models";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
};

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

export const GroupDataRows = <T,>({ groupedData, renderRow, expandedRow, setExpandedRow, entityId }: GroupDataRowsProps<T>) => {
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set(groupedData.map((_, index) => index)));

    const handleToggle = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const toggleGroup = (groupIndex: number) => {
        setExpandedGroups((prev) => {
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
        } else if (entityId === "event") {
            return calculateEventGroupStats(data as EventModel[]);
        }
        return [];
    };

    return (
        <div className="space-y-6">
            {groupedData.map((group, groupIndex) => {
                const isGroupExpanded = expandedGroups.has(groupIndex);
                return (
                    <motion.div
                        key={groupIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
                        className="flex flex-col gap-2 rounded-lg border border-border"
                    >
                        <div className="bg-muted/30 px-6 py-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleGroup(groupIndex)}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <motion.div animate={{ rotate: isGroupExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                        <AdranlinkIcon className="w-4 h-4 -translate-y-0.5" />
                                    </motion.div>
                                    <h3 className="text-lg font-semibold">{group.label}</h3>
                                </div>
                                <div className="flex items-center gap-6">
                                    <RowStats stats={getGroupStats(group.data)} />
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {isGroupExpanded && (
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    variants={containerVariants}
                                    className="flex flex-col gap-2"
                                >
                                    {group.data.map((item, index) => (
                                        <motion.div key={item.schema.id} variants={rowVariants} transition={{ duration: 0.2, delay: index * 0.03 }}>
                                            {renderRow(item, expandedRow === item.schema.id, handleToggle)}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
    );
};
