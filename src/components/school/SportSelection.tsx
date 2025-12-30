"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export const SPORTS_CONFIG = [
    { id: "kite", label: "Kitesurfing", image: "/categories/kite.webp" },
    { id: "wing", label: "Wing Foiling", image: "/categories/wing.webp" },
    { id: "windsurf", label: "Windsurfing", image: "/categories/wind.webp" },
] as const;

export type SportId = typeof SPORTS_CONFIG[number]["id"];

interface SportSelectionProps {
    selectedSport: string | null;
    onSelectSport: (id: string | null) => void;
    variant?: "landing" | "schools";
    counts?: Record<string, number>;
}

export function SportSelection({ selectedSport, onSelectSport, variant = "schools", counts }: SportSelectionProps) {
    const [hoveredSport, setHoveredSport] = useState<string | null>(null);

    const isLanding = variant === "landing";

    return (
        <div className={`grid grid-cols-3 md:flex md:flex-row gap-4 w-full items-stretch justify-center ${isLanding ? "h-[100px] md:h-[140px]" : "h-[80px] md:h-[110px]"}`}>
            {SPORTS_CONFIG.map((sport) => {
                const isSelected = selectedSport === sport.id;
                const isHovered = hoveredSport === sport.id;
                const count = counts?.[sport.id] ?? 0;

                return (
                    <motion.div
                        key={sport.id}
                        layout
                        initial={{ flex: 1 }}
                        animate={{
                            flex: isHovered ? 2 : 1,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <motion.button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onSelectSport(isSelected ? null : sport.id);
                            }}
                            onHoverStart={() => setHoveredSport(sport.id)}
                            onHoverEnd={() => setHoveredSport(null)}
                            className={`relative rounded-[2rem] overflow-hidden border transition-all duration-500 flex flex-col items-center justify-center gap-2 w-full h-full shadow-lg ${
                                isSelected
                                    ? isLanding ? "bg-white/20 border-white/60 text-white z-10" : "bg-secondary/20 border-secondary text-secondary z-10"
                                    : isLanding 
                                        ? "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/15 hover:border-white/40"
                                        : "bg-card border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-border"
                            }`}
                        >
                            {/* Count Badge */}
                            {count > 0 && (
                                <div className={`absolute top-3 right-4 px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums border ${
                                    isSelected 
                                        ? "bg-foreground text-background border-transparent" 
                                        : "bg-muted/50 text-muted-foreground border-border/50"
                                }`}>
                                    {count}
                                </div>
                            )}

                            <motion.div
                                layout="position"
                                animate={{
                                    scale: isHovered ? 1.2 : 1,
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="relative"
                            >
                                <Image
                                    src={sport.image}
                                    alt={sport.label}
                                    width={isHovered ? 56 : 44}
                                    height={isHovered ? 56 : 44}
                                    className={`object-contain transition-all duration-300 ${
                                        isLanding 
                                            ? (isHovered || isSelected ? "brightness-0 invert" : "brightness-0 invert opacity-60")
                                            : (isHovered || isSelected ? "brightness-0 dark:invert" : "brightness-0 dark:invert opacity-70")
                                    }`}
                                />
                            </motion.div>

                            <motion.span
                                layout="position"
                                className={`hidden md:block text-xs font-black uppercase tracking-[0.2em] ${
                                    isLanding 
                                        ? (isHovered || isSelected ? "text-white" : "text-white/60")
                                        : (isHovered || isSelected ? "text-foreground" : "text-muted-foreground/60")
                                }`}
                            >
                                {sport.label}
                            </motion.span>
                        </motion.button>
                    </motion.div>
                );
            })}
        </div>
    );
}