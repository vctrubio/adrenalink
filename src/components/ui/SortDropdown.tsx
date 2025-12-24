"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { SortOption, SortConfig, SortDirection } from "@/types/sort";

interface SortDropdownProps {
    value: SortConfig;
    options: SortOption[];
    onChange: (config: SortConfig) => void;
    entityColor: string;
}

export function SortDropdown({ value, options, onChange, entityColor }: SortDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownRect, setDropdownRect] = useState({ top: 0, right: 0 });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownRect({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
            });
        }
    }, [isOpen]);

    const handleSortChange = (field: string) => {
        // If clicking the same field, toggle direction
        if (value.field === field) {
            const newDirection = value.direction === "asc" ? "desc" : "asc";
            onChange({ ...value, direction: newDirection });
        } else {
            // New field, default to desc (usually what people want for dates)
            onChange({ field, direction: "desc" });
        }
        setIsOpen(false);
    };

    const activeOption = options.find((o) => o.value === value.field);
    const displayLabel = activeOption ? activeOption.label : "Sort";

    return (
        <div ref={dropdownRef} className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm"
            >
                <div className="flex items-center -space-x-0.5">
                    <ArrowUp 
                        size={14} 
                        className="transition-all scale-y-[1.4] scale-x-90"
                        style={{ color: value.field && value.direction === "asc" ? entityColor : "currentColor", opacity: value.field && value.direction === "asc" ? 1 : 0.3 }} 
                    />
                    <ArrowDown 
                        size={14} 
                        className="transition-all scale-y-[1.4] scale-x-90"
                        style={{ color: value.field && value.direction === "desc" ? entityColor : "currentColor", opacity: value.field && value.direction === "desc" ? 1 : 0.3 }} 
                    />
                </div>
                
                <span className="font-medium" style={{ color: value.field ? entityColor : undefined }}>
                    {displayLabel}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="fixed min-w-[140px] bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                        style={{ top: `${dropdownRect.top}px`, right: `${dropdownRect.right}px` }}
                    >
                        {options.map((option) => {
                            const isActive = value.field === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleSortChange(option.value)}
                                    className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center justify-between ${isActive ? "bg-muted font-medium" : "hover:bg-muted/50"}`}
                                    style={{ color: isActive ? entityColor : undefined }}
                                >
                                    <span>{option.label}</span>
                                    {isActive && (
                                        <span className="text-xs opacity-70">
                                            {value.direction === "asc" ? "Oldest" : "Newest"}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
