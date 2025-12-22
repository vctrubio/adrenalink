"use client";

import { motion } from "framer-motion";

interface ExpandCollapseIconProps {
    isExpanded: boolean;
    className?: string;
}

export function ExpandCollapseIcon({ isExpanded, className = "w-6 h-6" }: ExpandCollapseIconProps) {
    return (
        <motion.svg
            viewBox="0 0 24 24"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            {/* Arrow pointing right - rotates to down */}
            <polyline points="6,3 15,12 6,21" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
    );
}
