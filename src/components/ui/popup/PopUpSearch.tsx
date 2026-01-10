"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useRef, useEffect } from "react";
import type { PopUpSearchProps } from "@/types/popup";

export function PopUpSearch({ value, onChange, placeholder = "Search...", className = "" }: PopUpSearchProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Auto-focus on mount with a slight delay to ensure modal is ready
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
            className={`relative group ${className}`}
        >
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary dark:group-focus-within:text-secondary transition-colors">
                <Search className="w-4 h-4" />
            </div>
            <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/20 border border-border/40 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:focus:ring-secondary/40 focus:border-primary/40 dark:focus:border-secondary/40 transition-all backdrop-blur-md"
            />
        </motion.div>
    );
}
