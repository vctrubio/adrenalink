"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

interface MultiSelectFilterDropdownProps {
    label: string;
    selectedValues: string[];
    options: string[];
    onChange: (values: string[]) => void;
    entityColor: string;
}

export function MultiSelectFilterDropdown({ label, selectedValues, options, onChange, entityColor }: MultiSelectFilterDropdownProps) {
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

    const handleToggle = (option: string) => {
        if (selectedValues.includes(option)) {
            onChange(selectedValues.filter(v => v !== option));
        } else {
            onChange([...selectedValues, option]);
        }
    };

    const displayValue = selectedValues.length > 0
        ? selectedValues.length === 1
            ? selectedValues[0]
            : `${selectedValues.length} selected`
        : "None";

    return (
        <div ref={dropdownRef} className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm">
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <AdranlinkIcon className="w-4 h-4" />
                </motion.div>
                <span className="text-muted-foreground text-xs uppercase">{label}:</span>
                <span className="font-medium" style={{ color: entityColor }}>
                    {displayValue}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-1 min-w-[150px] bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                    >
                        {options.map((option) => {
                            const isSelected = selectedValues.includes(option);
                            return (
                                <button
                                    key={option}
                                    onClick={() => handleToggle(option)}
                                    className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 ${isSelected ? "bg-muted font-medium" : "hover:bg-muted/50"}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => {}}
                                        className="cursor-pointer"
                                        style={{ accentColor: entityColor }}
                                    />
                                    <span>{option}</span>
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
