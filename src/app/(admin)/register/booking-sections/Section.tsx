"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ExpandCollapseIcon } from "@/src/components/ui/ExpandCollapseIcon";

interface SectionProps {
    id: string;
    title: React.ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    entityIcon?: React.ComponentType<{ className?: string }>;
    entityColor?: string;
    alwaysExpanded?: boolean;
    optional?: boolean;
    hasSelection?: boolean;
    onClear?: () => void;
    onOptional?: () => void;
    showAddButton?: boolean;
    onAddClick?: () => void;
}

export function Section({
    id,
    title,
    isExpanded,
    onToggle,
    children,
    entityIcon: EntityIcon,
    entityColor,
    alwaysExpanded = false,
    optional = false,
    hasSelection = false,
    onClear,
    onOptional,
    showAddButton = false,
    onAddClick,
}: SectionProps) {
    const handleClick = () => {
        if (!alwaysExpanded) {
            onToggle();
        }
    };

    return (
        <motion.div id={id} className="scroll-mt-4" layout>
            <motion.div
                className={`rounded-lg bg-card border border-border ${alwaysExpanded ? "" : "hover:ring-1 hover:ring-black"}`}
                layout
            >
                {/* Header */}
                <div
                    className={`flex items-center justify-between p-4 ${alwaysExpanded ? "cursor-default" : "cursor-pointer active:bg-muted touch-manipulation"}`}
                    onClick={handleClick}
                >
                    <div className="flex items-center gap-3">
                        {EntityIcon && (
                            <div className="w-8 h-8 flex items-center justify-center" style={{ color: entityColor }}>
                                <EntityIcon className="w-8 h-8" />
                            </div>
                        )}
                        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {showAddButton && onAddClick && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddClick();
                                }}
                                className="px-3 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted/80 text-foreground transition-colors"
                                style={{ color: entityColor }}
                            >
                                + Add
                            </button>
                        )}
                        {optional ? (
                            <>
                                {hasSelection && onClear && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onClear();
                                        }}
                                        className="px-3 py-2 text-sm font-medium rounded-lg border border-border bg-muted hover:bg-muted/80 text-foreground transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                                {!hasSelection && onOptional && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onOptional();
                                        }}
                                        className="px-3 py-2 text-sm font-medium rounded-lg border border-border bg-muted hover:bg-muted/80 text-foreground transition-colors"
                                    >
                                        Not Now
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                {onClear && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onClear();
                                        }}
                                        disabled={!hasSelection}
                                        className="px-3 py-2 text-sm font-medium rounded-lg border border-border bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-muted"
                                    >
                                        Clear
                                    </button>
                                )}
                            </>
                        )}
                        {!alwaysExpanded && (
                            <div className="min-w-[24px] h-8 flex items-center justify-center text-primary">
                                <ExpandCollapseIcon isExpanded={isExpanded} className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content with Framer Motion animations */}
                <AnimatePresence initial={false}>
                    {(isExpanded || alwaysExpanded) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4">{children}</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
