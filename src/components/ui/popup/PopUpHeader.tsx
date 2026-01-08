"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { PopUpHeaderProps } from "@/types/popup";

export function PopUpHeader({ title, subtitle, icon, className = "" }: PopUpHeaderProps) {
    return (
        <div className={`mb-6 flex flex-col items-center ${className}`}>
            <div className="flex items-center gap-4 mb-1">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.05, duration: 0.3, ease: "easeOut" }}
                    className="shrink-0"
                >
                    {icon || (
                        <Image 
                            src="/ADR.webp" 
                            alt="Adrenalink" 
                            width={32} 
                            height={32} 
                            className="dark:invert drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                        />
                    )}
                </motion.div>
                
                <motion.h2 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
                    className="text-3xl font-black tracking-tighter text-foreground uppercase"
                >
                    {title}
                </motion.h2>
            </div>
            
            {subtitle && (
                <motion.p
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
                    className="text-muted-foreground/60 text-sm font-bold uppercase tracking-widest"
                >
                    {subtitle}
                </motion.p>
            )}
        </div>
    );
}
