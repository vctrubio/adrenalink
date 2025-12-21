"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ENTITY_DATA } from "@/config/entities";
import { DataboardStats } from "./DataboardStats";
import type { DataboardFilterByDate, DataboardGroupByDate, DataboardController as DataboardControllerType } from "@/types/databoard";
import type { StatItem } from "@/src/components/ui/row";

const FILTER_OPTIONS_DEFAULT: DataboardFilterByDate[] = ["All", "Last 7 days", "Last 30 days"];
const FILTER_OPTIONS_EQUIPMENT: DataboardFilterByDate[] = ["All", "Last 7 days", "Last 30 days", "Active"];
const GROUP_OPTIONS: DataboardGroupByDate[] = ["All", "Daily", "Weekly", "Monthly"];
const getActivityOptions = (entityId: string) => {
    if (entityId === "event") {
        return ["All", "Completed", "Uncompleted"] as const;
    }
    return ["All", "Active", "Inactive"] as const;
};

const fadeSlide = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

export function DataboardHeaderSkeleton() {
    return (
        <div className="flex items-center gap-4 px-2 animate-pulse">
            <div className="w-14 h-14 rounded-full border-2 border-muted bg-muted/30 flex-shrink-0" />
            <div className="h-8 w-32 sm:w-40 bg-muted/50 rounded-lg" />
        </div>
    );
}

interface FilterDropdownProps {
    label: string;
    value: string;
    options: readonly string[];
    onChange: (value: string) => void;
    entityColor: string;
}

function FilterDropdown({ label, value, options, onChange, entityColor }: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm">
                <span className="text-muted-foreground text-xs uppercase">{label}:</span>
                <span className="font-medium" style={{ color: entityColor }}>
                    {value}
                </span>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-1 min-w-[120px] bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                    >
                        {options.map((option) => {
                            const isActive = value === option;
                            return (
                                <button
                                    key={option}
                                    onClick={() => {
                                        onChange(option);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm transition-colors ${isActive ? "bg-muted font-medium" : "hover:bg-muted/50"}`}
                                    style={{ color: isActive ? entityColor : undefined }}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface DataboardHeaderProps {
    controller: DataboardControllerType;
    entityId: string;
    stats: StatItem[];
}

export function DataboardHeader({ controller, entityId, stats }: DataboardHeaderProps) {
    const entity = ENTITY_DATA.find((e) => e.id === entityId);
    if (!entity) return null;

    const Icon = entity.icon;
    const filterOptions = entityId === "equipment" ? FILTER_OPTIONS_EQUIPMENT : FILTER_OPTIONS_DEFAULT;

    return (
        <div className="space-y-4">
            {/* Top Row: Icon + Name | Stats */}
            <div className="flex items-center justify-between gap-6">
                <AnimatePresence mode="wait">
                    <motion.div key={entityId} variants={fadeSlide} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="flex items-center gap-4 px-2">
                        <motion.div
                            className="w-14 h-14 flex items-center justify-center rounded-full border-2 [&>svg]:w-full [&>svg]:h-full flex-shrink-0 p-2.5"
                            style={{ borderColor: entity.color, color: entity.color }}
                            initial={{ scale: 0.8, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        >
                            <Icon />
                        </motion.div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{entity.name}</h1>
                    </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    <motion.div key={entityId} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2, delay: 0.1 }} className="flex-shrink-0">
                        <DataboardStats stats={stats} />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Search + Filter Controls */}
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all"
                        style={{
                            "--focus-ring-color": entity.color,
                        } as React.CSSProperties}
                        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${entity.color}40`)}
                        onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <FilterDropdown label="Filter" value={controller.filter} options={filterOptions} onChange={controller.onFilterChange} entityColor={entity.color} />
                    <FilterDropdown label="Group" value={controller.group} options={GROUP_OPTIONS} onChange={controller.onGroupChange} entityColor={entity.color} />
                    <FilterDropdown label="Status" value={controller.activity} options={getActivityOptions(entityId)} onChange={(v) => controller.onActivityChange(v)} entityColor={entity.color} />
                </div>
            </div>
        </div>
    );
}
