"use client";

import { useState } from "react";
import Image from "next/image";
import { Clock } from "lucide-react";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment"; 
import { motion } from "framer-motion";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { SchoolPackageType } from "@/drizzle/schema";
import { GoToAdranlink } from "@/src/components/ui/GoToAdranlink";
import { SPORTS_CONFIG } from "./SportSelection";

interface SchoolPackageCardProps {
    pkg: SchoolPackageType & { bookingCount: number };
    currencySymbol: string;
}

/**
 * Premium Card for individual school packages
 */
export const SchoolPackageCard = ({ pkg, currencySymbol }: SchoolPackageCardProps) => {
    const { id, description, pricePerStudent, durationMinutes, categoryEquipment, packageType } = pkg;
    const [isHovered, setIsHovered] = useState(false);
    
    const sportConfig = SPORTS_CONFIG.find(s => s.id === categoryEquipment);
    const categoryConfig = EQUIPMENT_CATEGORIES.find(c => c.id === categoryEquipment);

    // Calculate PPH if duration > 1hr
    const pph = durationMinutes > 60 ? Math.round(pricePerStudent / (durationMinutes / 60)) : null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={() => console.log("Selected Package ID:", id)}
            className="group bg-card hover:bg-muted/50 border border-border/50 hover:border-secondary/50 rounded-[2rem] p-6 shadow-lg transition-all cursor-pointer flex flex-col gap-6 relative overflow-hidden"
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl -mr-10 -mt-10 rounded-full" />

            <div className="flex justify-between items-start relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-border/50 shadow-inner bg-background p-2">
                    {sportConfig ? (
                        <Image 
                            src={sportConfig.image} 
                            alt="" 
                            width={40} 
                            height={40} 
                            className={`object-contain transition-all duration-500 brightness-0 dark:invert ${isHovered ? "opacity-100" : "opacity-70"}`}
                        />
                    ) : (
                        <AdranlinkIcon size={28} className="text-muted-foreground opacity-20" />
                    )}
                </div>
                <div className="text-right">
                    <span className="block text-2xl font-black text-foreground tracking-tighter leading-none tabular-nums">
                        <span className="text-muted-foreground/50 mr-1">{currencySymbol}</span>
                        {pricePerStudent}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                        Per Person
                    </span>
                </div>
            </div>

            <div className="flex-1 space-y-2 relative z-10">
                <h4 className="text-xl font-black text-foreground tracking-tighter leading-tight line-clamp-2 uppercase">
                    {description}
                </h4>
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border/30 shadow-sm">
                        <Clock size={12} className="text-secondary" />
                        <span>{getPrettyDuration(durationMinutes)}</span>
                    </div>
                    {pph && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-secondary bg-secondary/10 px-2.5 py-1 rounded-lg border border-secondary/20 shadow-sm">
                            <span className="text-[10px] opacity-60">{currencySymbol}</span>
                            <span>{pph} P/H</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                        {categoryConfig?.name || "Activity"}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md bg-secondary/10 text-secondary">
                        {packageType}
                    </span>
                </div>
                <GoToAdranlink 
                    size={24} 
                    isHovered={isHovered} 
                    className={isHovered ? "text-secondary" : "text-muted-foreground/20"} 
                />
            </div>
        </motion.div>
    );
};
