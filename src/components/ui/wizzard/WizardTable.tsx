"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";

export interface WizardColumn<T> {
    id: string;
    header: ReactNode;
    cell: (item: T, context: { isFocused: boolean; isHovered: boolean }) => ReactNode;
    width?: string;
    align?: "left" | "center" | "right";
    className?: string;
}

interface WizardTableProps<T> {
    data: T[];
    columns: WizardColumn<T>[];
    onRowClick?: (item: T) => void;
    groupBy?: (item: T) => string;
    groupHeader?: (groupKey: string, count: number, isExpanded: boolean) => ReactNode;
    getRowId?: (item: T) => string;
    getRowAccentColor?: (item: T) => string;
    selectedId?: string;
    accentColor?: string;
    hideHeader?: boolean;
    className?: string;
    entityId?: string;
}

export function WizardTable<T>({
    data,
    columns,
    onRowClick,
    groupBy,
    groupHeader,
    getRowId,
    getRowAccentColor,
    selectedId,
    accentColor = "#3b82f6", // Default blue
    hideHeader = false,
    className = "",
    entityId,
}: WizardTableProps<T>) {
    const router = useRouter();
    const getId = (item: T) => (getRowId ? getRowId(item) : (item as any).id);
    const getRowColor = (item: T) => (getRowAccentColor ? getRowAccentColor(item) : accentColor);

    const handleRowClick = (item: T) => {
        if (entityId) {
            const id = getId(item);
            const routeMap: Record<string, string> = {
                schoolPackage: "packages",
            };
            const route = routeMap[entityId] || `${entityId}s`;
            router.push(`/${route}/${id}`);
        }
        onRowClick?.(item);
    };

    const grouped = groupBy
        ? data.reduce(
            (acc, item) => {
                const key = groupBy(item);
                if (!acc[key]) acc[key] = [];
                acc[key].push(item);
                return acc;
            },
            {} as Record<string, T[]>,
        )
        : { All: data };

    const groups = Object.entries(grouped);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(groups.map(([key]) => key)));

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const toggleGroup = (key: string) => {
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    return (
        <div className={`w-full overflow-hidden rounded-2xl border border-border/30 dark:border-white/10 bg-card/50 backdrop-blur-xl shadow-2xl ${className}`}>
            {!hideHeader && (
                <div
                    className="grid border-b border-border/30 dark:border-white/10 bg-muted/30 dark:bg-white/5 py-4 px-12 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/80"
                    style={{
                        gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" "),
                    }}
                >
                    {columns.map((col) => (
                        <div key={col.id} className={`flex ml-4 items-center ${col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : "justify-start"} ${col.className || ""}`}>
                            {col.header}
                        </div>
                    ))}
                </div>
            )}

            <div className="custom-scrollbar overflow-y-auto max-h-[70vh] flex flex-col gap-3 p-4">
                {groups.map(([groupKey, groupData], groupIdx) => (
                    <div key={groupKey} className="flex flex-col gap-3">
                        {groupBy && groupKey !== "All" && (
                            <motion.div
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    scale: 1,
                                }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                onClick={() => toggleGroup(groupKey)}
                                className={`relative group rounded-xl border cursor-pointer ${expandedGroups.has(groupKey) ? "popup-row-focused" : "popup-row"}`}
                                style={{
                                    gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" "),
                                }}
                            >
                                {expandedGroups.has(groupKey) && (
                                    <motion.div
                                        layoutId={`wizard-group-indicator-${groupKey}`}
                                        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
                                        style={{ backgroundColor: accentColor }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                )}
                                <div className="flex items-center relative z-[1] col-span-full">
                                    {groupHeader ? (
                                        groupHeader(groupKey, groupData.length, expandedGroups.has(groupKey))
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <ToggleAdranalinkIcon 
                                                isOpen={expandedGroups.has(groupKey)} 
                                                color={accentColor} 
                                            />
                                            <span className="font-bold text-lg tracking-tight" style={{ color: accentColor }}>
                                                {groupKey}
                                            </span>
                                            <span className="text-muted-foreground/50 text-xs font-mono">[{groupData.length} UNITS]</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        <AnimatePresence initial={false}>
                            {(groupBy === undefined || expandedGroups.has(groupKey)) && (
                                <motion.div
                                    initial="collapsed"
                                    animate="open"
                                    exit="collapsed"
                                    variants={{
                                        open: { opacity: 1, height: "auto" },
                                        collapsed: { opacity: 0, height: 0 },
                                    }}
                                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                    className="overflow-hidden flex flex-col gap-3"
                                >
                                    {groupData.map((item, idx) => {
                                        const rowId = getId(item);
                                        const rowColor = getRowColor(item);
                                        const isSelected = selectedId === rowId;
                                        const uniqueKey = rowId && rowId !== "" ? rowId : `row-${groupKey}-${idx}`;
                                        const isHovered = hoveredId === uniqueKey;

                                        return (
                                            <motion.div
                                                key={uniqueKey}
                                                data-row-id={rowId}
                                                layout
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{
                                                    opacity: 1,
                                                    x: 0,
                                                    scale: 1,
                                                }}
                                                transition={{ duration: 0.3, ease: "easeOut" }}
                                                onClick={() => handleRowClick(item)}
                                                onMouseEnter={() => setHoveredId(uniqueKey)}
                                                onMouseLeave={() => setHoveredId(null)}
                                                className={`grid px-4 py-3 transition-all relative group rounded-xl border ${isSelected ? "popup-row-focused" : "popup-row"} ${entityId || onRowClick ? "cursor-pointer" : ""}`}
                                                style={{
                                                    gridTemplateColumns: columns.map((c) => c.width || "1fr").join(" "),
                                                }}
                                            >
                                                {isSelected && (
                                                    <motion.div
                                                        layoutId="wizard-selection-indicator"
                                                        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-secondary"
                                                        style={{ backgroundColor: rowColor }}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.2 }}
                                                    />
                                                )}

                                                {columns.map((col) => (
                                                    <div key={`${uniqueKey}-${col.id}`} className={`flex items-center relative z-[1] ${col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : "justify-start"} ${col.className || ""}`}>
                                                        {col.cell(item, { isFocused: isSelected, isHovered })}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}
