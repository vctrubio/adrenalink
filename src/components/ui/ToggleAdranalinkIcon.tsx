"use client";

import { motion } from "framer-motion";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon.jsx";

interface ToggleAdranalinkIconProps {
    isOpen: boolean;
    onClick?: () => void;
    color?: string;
    className?: string;
    variant?: "sm" | "lg";
}

export function ToggleAdranalinkIcon({ isOpen, onClick, color, className, variant = "sm" }: ToggleAdranalinkIconProps) {
    const size = variant === "lg" ? 32 : 20;

    const iconContent = (
        <motion.div 
            animate={{ rotate: isOpen ? 180 : 0 }}
            whileHover={{ rotate: isOpen ? 192 : 12 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={!onClick ? className : "origin-center"}
            style={color ? { color } : undefined}
        >
            <AdranlinkIcon size={size} />
        </motion.div>
    );

    if (onClick) {
        return (
            <button
                onClick={onClick}
                className={`relative outline-none ${className || ""}`}
                aria-label={isOpen ? "Collapse details" : "Expand details"}
            >
                {iconContent}
            </button>
        );
    }

    return iconContent;
}
