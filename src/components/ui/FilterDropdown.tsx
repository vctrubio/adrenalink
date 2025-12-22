"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

interface FilterDropdownProps {
    label: string;
    value: string;
    options: readonly string[];
    onChange: (value: string) => void;
    entityColor: string;
}

export function FilterDropdown({ label, value, options, onChange, entityColor }: FilterDropdownProps) {
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
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <AdranlinkIcon className="w-4 h-4" />
                </motion.div>
                <span className="text-muted-foreground text-xs uppercase">{label}:</span>
                <span className="font-medium" style={{ color: entityColor }}>
                    {value}
                </span>
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
