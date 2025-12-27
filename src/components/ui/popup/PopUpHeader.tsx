"use client";

import { motion } from "framer-motion";
import type { PopUpHeaderProps } from "@/types/popup";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

export function PopUpHeader({ title, subtitle, icon, className = "" }: PopUpHeaderProps) {
    return (
        <div className={`mb-6 flex flex-col items-center ${className}`}>
            <div className="flex items-center gap-4 mb-1">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.05, duration: 0.3, ease: "easeOut" }}
                    className="text-white"
                >
                    {icon || <AdranlinkIcon size={32} className="drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />}
                </motion.div>
                
                <motion.h2 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
                    className="text-3xl font-bold tracking-tight text-white"
                >
                    {title}
                </motion.h2>
            </div>
            
            {subtitle && (
                <motion.p
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
                    className="text-white/40 text-sm font-medium"
                >
                    {subtitle}
                </motion.p>
            )}
        </div>
    );
}
