"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useRef, useEffect } from "react";
import type { PopUpSearchProps } from "@/types/popup";

export function PopUpSearch({ value, onChange, placeholder = "Search...", className = "" }: PopUpSearchProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Auto-focus on mount
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
            className={`relative group ${className}`}
        >
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-white transition-colors">
                <Search className="w-4 h-4" />
            </div>
            <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/50 transition-all backdrop-blur-md shadow-lg"
            />
        </motion.div>
    );
}
