"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export const SPORTS_CONFIG = [
    { id: "kite", label: "Kitesurfing", image: "/categories/kite.webp" },
    { id: "wing", label: "Wing Foiling", image: "/categories/wing.webp" },
    { id: "windsurf", label: "Windsurfing", image: "/categories/wind.webp" },
] as const;

export type SportId = (typeof SPORTS_CONFIG)[number]["id"];

interface SportSelectionProps {
    selectedSport: string | null;
    onSelectSport: (id: string | null) => void;
    variant?: "landing" | "schools";
    counts?: Record<string, number>;
}

export function SportSelection({ selectedSport, onSelectSport, variant = "schools", counts }: SportSelectionProps) {
    const [hoveredSport, setHoveredSport] = useState<string | null>(null);

    const isLanding = variant === "landing";

    const visibleSports = counts ? SPORTS_CONFIG.filter((sport) => (counts[sport.id] || 0) > 0) : SPORTS_CONFIG;

    return (
        <div
            className={`grid grid-cols-3 md:flex md:flex-row gap-2 sm:gap-3 md:gap-4 w-full items-stretch ${isLanding ? "h-[90px] sm:h-[100px] md:h-[140px]" : "h-[80px] md:h-[110px]"}`}
        >
            {/* Desktop buttons with hover effects */}
            {visibleSports.map((sport) => {
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
                        className="hidden md:block"
                    >
                        <motion.button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onSelectSport(isSelected ? null : sport.id);
                            }}
                            onHoverStart={() => setHoveredSport(sport.id)}
                            onHoverEnd={() => setHoveredSport(null)}
                            className={`relative rounded-[2rem] overflow-hidden border transition-all duration-500 flex flex-col items-center justify-center gap-2 w-full h-full shadow-lg ${isLanding ? "backdrop-blur-lg text-white" : ""} ${
                                isSelected
                                    ? isLanding
                                        ? isHovered
                                            ? "bg-white/30 border-white/80 z-10"
                                            : "bg-white/20 border-white/60 z-10"
                                        : "bg-secondary/20 border-secondary text-secondary z-10"
                                    : isLanding
                                      ? "bg-slate-950/60 border-white/10 hover:bg-slate-950/70 hover:border-white/40"
                                      : "bg-card border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-border"
                            }`}
                        >
                            {/* Count Badge */}
                            {count > 0 && (
                                <div
                                    className={`absolute top-3 right-4 px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums border ${
                                        isSelected
                                            ? "bg-foreground text-background border-transparent"
                                            : "bg-muted/50 text-muted-foreground border-border/50"
                                    }`}
                                >
                                    {count}
                                </div>
                            )}

                            <motion.div
                                layout="position"
                                animate={{
                                    scale: isHovered ? 1.2 : 1,
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="relative w-14 h-10 md:w-20 md:h-14"
                            >
                                <Image
                                    src={sport.image}
                                    alt={sport.label}
                                    fill
                                    className={`object-fill transition-all duration-300 ${
                                        isLanding
                                            ? "brightness-0 invert"
                                            : isHovered || isSelected
                                              ? "brightness-0 dark:invert"
                                              : "brightness-0 dark:invert opacity-70"
                                    }`}
                                />
                            </motion.div>

                            <motion.span
                                layout="position"
                                className={`hidden md:block text-xs font-black uppercase tracking-[0.2em] ${
                                    isLanding
                                        ? "text-white"
                                        : isHovered || isSelected
                                          ? "text-foreground"
                                          : "text-muted-foreground/60"
                                }`}
                            >
                                {sport.label}
                            </motion.span>
                        </motion.button>
                    </motion.div>
                );
            })}
            {/* Mobile buttons - simpler without hover effects */}
            {isLanding && visibleSports.map((sport) => {
                const isSelected = selectedSport === sport.id;
                return (
                    <button
                        key={`${sport.id}-mobile`}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSelectSport(isSelected ? null : sport.id);
                        }}
                        className={`relative rounded-xl overflow-hidden border transition-all duration-500 flex flex-col items-center justify-center gap-1 w-full h-full shadow-lg backdrop-blur-lg text-white md:hidden ${
                            isSelected
                                ? "bg-white/20 border-white/60 z-10"
                                : "bg-slate-950/60 border-white/10 active:bg-slate-950/80"
                        }`}
                    >
                        <div className="relative w-10 h-7">
                            <Image
                                src={sport.image}
                                alt={sport.label}
                                fill
                                className="object-fill brightness-0 invert"
                            />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] transition-colors duration-300 text-white">
                            {sport.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
