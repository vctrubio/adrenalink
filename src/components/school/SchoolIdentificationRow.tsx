"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import adrLogo from "@/public/ADR.webp";
import { SPORTS_CONFIG } from "./SportSelection";
import type { School } from "@/supabase/db/types";

interface SchoolIdentificationRowProps {
    school: School;
    index: number;
    hoveredIndex: number | null;
    setHoveredIndex: (i: number | null) => void;
    hoveredSportId: string | null;
    setHoveredSportId: (id: string | null) => void;
}

/**
 * Sub-component for individual school rows
 */
export const SchoolIdentificationRow = ({ 
    school, 
    index, 
    hoveredIndex, 
    setHoveredIndex,
    hoveredSportId,
    setHoveredSportId
}: SchoolIdentificationRowProps) => {
    const isRowHovered = hoveredIndex === index;

    // Build CDN URLs with fallbacks
    const cdnUrls = useMemo(() => {
        const CDN_BASE = "https://cdn.adrenalink.tech";
        return {
            banner: `${CDN_BASE}/${school.username}/banner.png`,
            icon: `${CDN_BASE}/${school.username}/icon.png`,
        };
    }, [school.username]);

    return (
        <Link
            href={`https://${school.username}.adrenalink.tech`}
            target="_blank"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="group relative py-8 md:py-16 flex flex-col md:flex-row items-center gap-8 md:gap-16 transition-all px-12 rounded-[4rem] cursor-pointer overflow-hidden bg-card/30 hover:bg-card/60 border border-transparent hover:border-border/50 shadow-sm hover:shadow-2xl"
        >
            {/* Username Badge */}
            <div className="absolute top-0 right-0 z-20">
                <div className="bg-card px-8 py-3 rounded-bl-[2.5rem] border-b border-l border-border/50 flex items-center gap-3 shadow-sm">
                    <Image src={adrLogo} alt="" width={16} height={16} className="dark:invert" />
                    <span className="text-md font-black tracking-[0.4em] text-primary uppercase">{school.username}</span>
                </div>
            </div>

            {/* Banner Background */}
            <div className="absolute inset-0 z-0">
                <Image 
                    src={cdnUrls.banner}
                    alt="" 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-[0.15] group-hover:opacity-[0.3]"
                    onError={(e) => {
                        // Fallback to admin banner if custom doesn't exist
                        e.currentTarget.src = `https://cdn.adrenalink.tech/admin/banner.png`;
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
            </div>

            {/* School Icon */}
            <div className="relative z-10 w-32 h-32 md:w-48 md:h-48 flex-shrink-0 transition-all duration-700 rounded-full overflow-hidden shadow-2xl bg-background border-4 border-card">
                <Image 
                    src={cdnUrls.icon}
                    alt={school.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                        // Fallback to admin icon if custom doesn't exist
                        e.currentTarget.src = `https://cdn.adrenalink.tech/admin/icon.png`;
                    }}
                />
            </div>

            {/* Name and Info */}
            <div className="relative z-10 flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                <h3 className="font-display text-5xl md:text-8xl font-black text-foreground tracking-tighter leading-none mb-8">
                    {school.name}
                </h3>
                <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-sm md:text-md opacity-40">
                    {school.country}
                </p>
            </div>

            {/* Sport Categories - Interactive Grid */}
            <div className="relative z-10 flex gap-4 md:gap-8">
                {SPORTS_CONFIG.filter(sport => {
                    if (!school.equipment_categories) return false;
                    const categories = school.equipment_categories.split(",").map(c => c.trim());
                    return categories.includes(sport.id);
                }).map((sport) => {
                    const uniqueSportId = `${school.username}-${sport.id}`;
                    const isSportHovered = hoveredSportId === uniqueSportId;
                    
                    return (
                        <motion.div
                            key={sport.id}
                            onMouseEnter={() => setHoveredSportId(uniqueSportId)}
                            onMouseLeave={() => setHoveredSportId(null)}
                            layout
                            animate={{
                                width: isSportHovered ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 140 : 220) : (typeof window !== 'undefined' && window.innerWidth < 768 ? 72 : 96),
                                backgroundColor: isSportHovered ? "rgba(var(--secondary), 0.1)" : "rgba(255,255,255,0.03)"
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative h-16 md:h-24 rounded-[2.5rem] border border-border/30 overflow-hidden flex items-center gap-5 px-4 group/sport transition-colors duration-300 backdrop-blur-md"
                        >
                            <div className="relative w-8 h-8 md:w-12 md:h-12 shrink-0">
                                <Image
                                    src={sport.image}
                                    alt={sport.label}
                                    fill
                                    className={`object-contain transition-all duration-300 brightness-0 dark:invert ${isSportHovered || isRowHovered ? "opacity-100" : "opacity-20 grayscale"}`}
                                />
                            </div>
                            <AnimatePresence>
                                {isSportHovered && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="text-xs font-black uppercase tracking-widest text-foreground whitespace-nowrap"
                                    >
                                        {sport.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </Link>
    );
};
