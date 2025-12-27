"use client";

import { motion } from "framer-motion";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon.jsx";

interface ToggleAdranalinkIconProps {
    isOpen: boolean;
    onClick: () => void;
}

export function ToggleAdranalinkIcon({ isOpen, onClick }: ToggleAdranalinkIconProps) {
    return (
        <button
            onClick={onClick}
            className="relative text-foreground/80 hover:text-primary transition-colors duration-300 outline-none ml-4"
            aria-label={isOpen ? "Collapse details" : "Expand details"}
        >
            <motion.div 
                animate={{ rotate: isOpen ? 180 : 0 }}
                whileHover={{ rotate: isOpen ? 192 : 12 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="origin-center"
            >
                <AdranlinkIcon size={32} />
            </motion.div>
        </button>
    );
}
