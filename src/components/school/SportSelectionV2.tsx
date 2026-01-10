"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { SPORTS_CONFIG } from "./SportSelection";

interface SportSelectionV2Props {
    selectedSport: string | null;
    onSelectSport: (id: string | null) => void;
    counts?: Record<string, number>;
}

export function SportSelectionV2({ selectedSport, onSelectSport, counts }: SportSelectionV2Props) {
    const [hoveredSport, setHoveredSport] = useState<string | null>(null);

    const visibleSports = counts ? SPORTS_CONFIG.filter((sport) => (counts[sport.id] || 0) > 0) : SPORTS_CONFIG;

    if (visibleSports.length === 0) return null;

    return (
        <div className="flex flex-wrap justify-center gap-4">
            {visibleSports.map((sport) => {
                const isSelected = selectedSport === sport.id;
                const isHovered = hoveredSport === sport.id;
                const count = counts?.[sport.id] ?? 0;

                return (
                    <motion.button
                        key={sport.id}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSelectSport(isSelected ? null : sport.id);
                        }}
                        onHoverStart={() => setHoveredSport(sport.id)}
                        onHoverEnd={() => setHoveredSport(null)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`group relative flex items-center gap-4 px-6 py-4 rounded-3xl border-2 transition-all duration-300 ${
                            isSelected
                                ? "bg-zinc-900 border-zinc-900 text-white shadow-xl shadow-zinc-200"
                                : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200 hover:text-zinc-900 hover:shadow-lg hover:shadow-zinc-100"
                        }`}
                    >
                        <div className="relative w-12 h-8 shrink-0">
                            <Image
                                src={sport.image}
                                alt={sport.label}
                                fill
                                className={`object-contain transition-all duration-300 ${
                                    isSelected ? "brightness-0 invert" : "brightness-0 opacity-40 group-hover:opacity-100"
                                }`}
                            />
                        </div>

                        <div className="flex flex-col items-start">
                            <span className="text-xs font-black uppercase tracking-widest leading-none mb-1">{sport.label}</span>
                            {count > 0 && (
                                <span
                                    className={`text-[10px] font-bold uppercase tracking-wider ${
                                        isSelected ? "text-zinc-400" : "text-zinc-300 group-hover:text-zinc-400"
                                    }`}
                                >
                                    {count} {count === 1 ? "Package" : "Packages"}
                                </span>
                            )}
                        </div>

                        {isSelected && (
                            <motion.div
                                layoutId="activeIndicator"
                                className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
