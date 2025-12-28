"use client";

import { motion } from "framer-motion";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

interface SpinAdranalinkProps {
    isSpinning?: boolean;
    className?: string;
    size?: number;
    duration?: number;
}

export function SpinAdranalink({ 
    isSpinning = false, 
    className = "", 
    size = 24,
    duration = 1
}: SpinAdranalinkProps) {
    return (
        <motion.div
            className={`inline-flex items-center justify-center ${className}`}
            animate={{ 
                rotate: isSpinning ? 360 : 0, 
            }}
            transition={{ 
                duration: isSpinning ? duration : 0.3, 
                ease: isSpinning ? "linear" : "easeOut", 
                repeat: isSpinning ? Infinity : 0 
            }}
        >
            <AdranlinkIcon size={size} />
        </motion.div>
    );
}