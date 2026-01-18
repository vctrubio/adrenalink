"use client";

import { useMemo, useState } from "react";
import { SchoolPackageCard } from "./SchoolPackageCard";
interface SchoolPackageType {
    id: string;
    description: string;
    pricePerStudent: number;
    durationMinutes: number;
    categoryEquipment: string;
    capacityStudents: number;
    capacityEquipment: number;
    packageType: string;
    active: boolean;
    isPublic: boolean;
}
import { SPORTS_CONFIG } from "./SportSelection";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface SchoolPackageBoardProps {
    packages: (SchoolPackageType & { bookingCount: number })[];
    currencySymbol: string;
}

export function SchoolPackageBoard({ packages, currencySymbol }: SchoolPackageBoardProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Group packages by category
    const groupedPackages = useMemo(() => {
        const groups: Record<string, typeof packages> = {};
        packages.forEach((pkg) => {
            const cat = pkg.categoryEquipment || "Other";
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(pkg);
        });
        return groups;
    }, [packages]);

    // Get sorted categories based on SPORTS_CONFIG order or just keys
    const categories = useMemo(() => {
        const groupKeys = Object.keys(groupedPackages);
        // Sort based on SPORTS_CONFIG index to maintain consistent order
        return groupKeys.sort((a, b) => {
            const idxA = SPORTS_CONFIG.findIndex((s) => s.id === a);
            const idxB = SPORTS_CONFIG.findIndex((s) => s.id === b);
            // Put known categories first, then others
            if (idxA === -1 && idxB === -1) return a.localeCompare(b);
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
        });
    }, [groupedPackages]);

    if (categories.length === 0) return null;

    return (
        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-6 md:gap-8 overflow-y-auto md:overflow-x-auto md:overflow-y-hidden p-1 justify-evenly">
            {categories.map((cat) => {
                const categoryPackages = groupedPackages[cat];
                const sportConfig = SPORTS_CONFIG.find((s) => s.id === cat);
                const label = sportConfig?.label || cat;
                const icon = sportConfig?.image;

                const isSelected = selectedCategory === cat;
                const isDimmed = selectedCategory !== null && !isSelected;

                return (
                    <motion.div
                        key={cat}
                        layout
                        initial={false}
                        animate={{
                            opacity: isDimmed ? 0.4 : 1,
                            scale: isSelected ? 1.02 : isDimmed ? 0.98 : 1,
                            filter: isDimmed ? "grayscale(100%)" : "grayscale(0%)",
                        }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setSelectedCategory(isSelected ? null : cat)}
                        className={`
                            flex-shrink-0 flex flex-col gap-4 w-full md:w-[380px] lg:w-[420px] max-h-full cursor-pointer transition-all
                            ${isSelected ? "z-10" : "z-0"}
                        `}
                    >
                        {/* Category Header */}
                        <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 ${isSelected ? "bg-zinc-50 border-zinc-200 shadow-sm" : "bg-transparent border-transparent"}`}
                        >
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors duration-300 ${isSelected ? "bg-white border-zinc-100" : "bg-zinc-50 border-zinc-100"}`}
                            >
                                {icon && (
                                    <div className="relative w-6 h-6">
                                        <Image
                                            src={icon}
                                            alt={label}
                                            fill
                                            className={`object-contain transition-all duration-300 ${isSelected ? "brightness-0" : "brightness-0 opacity-40"}`}
                                        />
                                    </div>
                                )}
                            </div>
                            <h3
                                className={`text-xl font-black uppercase tracking-tight transition-colors duration-300 ${isSelected ? "text-zinc-900" : "text-zinc-400"}`}
                            >
                                {label}
                            </h3>
                            <span
                                className={`ml-auto text-xs font-bold px-2 py-1 rounded-lg transition-colors duration-300 ${isSelected ? "bg-zinc-200 text-zinc-900" : "bg-zinc-50 text-zinc-300"}`}
                            >
                                {categoryPackages.length}
                            </span>
                        </div>

                        {/* Packages List - Vertical scroll on desktop column, Horizontal on mobile row */}
                        <div
                            className="
                            flex 
                            flex-row md:flex-col 
                            gap-4 
                            overflow-x-auto md:overflow-x-hidden md:overflow-y-auto 
                            pb-4 md:pb-2 md:pr-2
                            snap-x md:snap-none
                            scrollbar-hide
                        "
                        >
                            {categoryPackages.map((pkg) => (
                                <div key={pkg.id} className="w-[300px] md:w-full flex-shrink-0 snap-center">
                                    <SchoolPackageCard pkg={pkg} currencySymbol={currencySymbol} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
