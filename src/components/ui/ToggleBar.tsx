"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface ToggleOption<T extends string> {
    id: T;
    label: string;
    icon?: LucideIcon;
}

interface ToggleBarProps<T extends string> {
    value: T;
    onChange: (value: T) => void;
    options: ToggleOption<T>[];
    className?: string;
}

export function ToggleBar<T extends string>({ value, onChange, options, className = "" }: ToggleBarProps<T>) {
    return (
        <div
            className={`relative flex items-center p-1 rounded-xl bg-muted/20 border border-white/10 backdrop-blur-sm shadow-sm overflow-hidden ${className}`}
        >
            {options.map((option) => {
                const isActive = value === option.id;
                const Icon = option.icon;

                return (
                    <button
                        key={option.id}
                        onClick={() => onChange(option.id)}
                        className={`relative z-10 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                            isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                        }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="toggle-active-bg"
                                className="absolute inset-0 rounded-lg bg-background shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-border/50"
                                initial={false}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {Icon && <Icon size={16} className={isActive ? "text-primary" : "text-muted-foreground"} />}
                            <span>{option.label}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
