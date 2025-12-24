"use client";

import { type ReactNode, useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { RowStats, type StatItem } from "@/src/components/ui/row";
import type { AbstractModel } from "@/backend/models";

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
    groupedData: {
        label: string;
        data: AbstractModel<T>[];
    }[];
    renderRow: (item: AbstractModel<T>, isExpanded: boolean, onToggle: (id: string) => void) => ReactNode;
    expandedRow: string | null;
    setExpandedRow: (id: string | null) => void;
    entityId: string;
    entityColor: string;
    calculateStats?: (data: AbstractModel<T>[]) => StatItem[];
}

export const GroupDataRows = <T,>({ 
    groupedData, 
    renderRow, 
    expandedRow, 
    setExpandedRow, 
    entityColor,
    calculateStats 
}: GroupDataRowsProps<T>) => {
    // We use a set of collapsed labels. By default, everything is expanded.
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    // Reset collapsed groups when groupings change significantly (optional, but keep it clean)
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
                    <motion.div
                        key={group.label || groupIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: groupIndex * 0.05 }}
                        className={`flex flex-col gap-2 rounded-lg ${showHeader ? "border border-border shadow-sm overflow-hidden" : ""}`}
                    >
                        {showHeader && (
                            <div
                                className={`px-6 py-4 cursor-pointer transition-colors bg-card hover:bg-muted/30 ${isGroupExpanded ? "border-b border-border" : ""}`}
                                onClick={() => toggleGroup(group.label)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <motion.div animate={{ rotate: isGroupExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                            <AdranlinkIcon className="w-4 h-4 -translate-y-0.5" style={{ color: entityColor }} />
                                        </motion.div>
                                        <h3 className="text-xl font-bold">{group.label}</h3>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <RowStats stats={groupStats} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {isGroupExpanded && (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={containerVariants}
                                className="flex flex-col gap-2"
                            >
                                {group.data.map((item, index) => (
                                    <motion.div key={item.schema.id} variants={rowVariants} transition={{ duration: 0.2, delay: index * 0.02 }}>
                                        {renderRow(item, expandedRow === item.schema.id, handleToggle)}
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
};