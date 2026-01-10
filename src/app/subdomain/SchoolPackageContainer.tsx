"use client";

import { useMemo, useState } from "react";
import type { SchoolPackage } from "@/supabase/db/types";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { SPORTS_CONFIG } from "@/src/components/school/SportSelection";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface PackageCardProps {
    pkg: SchoolPackage;
    currencySymbol: string;
}

interface SchoolPackageContainerProps {
    packages: SchoolPackage[];
    currencySymbol: string;
}

/**
 * Game-style Package Card for subdomain view
 * Layout: Header (Title) -> Body (Stats & Capacity) -> Footer (Price Table & Action)
 */
export function PackageCard({ pkg, currencySymbol }: PackageCardProps) {
    const {
        id,
        name,
        description,
        price_per_student,
        duration_minutes,
        package_type,
        capacity_students,
        capacity_equipment,
        category_equipment,
    } = pkg;
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();

    // Get sport config for image
    const sportConfig = SPORTS_CONFIG.find((s) => s.id === category_equipment);

    // Determine type and color theme
    const isRental = package_type?.toLowerCase().includes("rental");
    const typeBg = isRental ? "bg-red-50" : "bg-blue-50";
    const typeText = isRental ? "text-red-600" : "text-blue-600";
    const typeBorder = isRental ? "border-red-100" : "border-blue-100";

    // Calculate PPH if duration != 1hr (60 mins)
    const durationHours = duration_minutes / 60;
    const pph = duration_minutes !== 60 ? Math.round(price_per_student / durationHours) : null;

    const handleCardClick = () => {
        router.push(`/register?add=package:${id}`);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.01 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={handleCardClick}
            className="group relative w-full overflow-hidden rounded-[2rem] bg-white border border-zinc-200 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col select-none"
        >
            {/* 1. Header (Top Bun) - Title & Type Label */}
            <div className="px-8 pt-8 pb-6 border-b border-dashed border-zinc-100 flex justify-between items-start gap-4">
                <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none text-zinc-900 group-hover:text-black transition-colors">
                    {description || name}
                </h4>
                {/* Type Badge */}
                {package_type && (
                    <span
                        className={`
                        shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                        ${isRental ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"}
                    `}
                    >
                        {package_type}
                    </span>
                )}
            </div>

            {/* 2. Middle (Patty) - Sport Image & Capacity */}
            <div className="px-8 py-8 flex items-center justify-between gap-6">
                {/* Sport Image */}
                {sportConfig?.image && (
                    <div className="relative w-20 h-20 flex-shrink-0">
                        <Image src={sportConfig.image} alt={sportConfig.id} fill className="object-contain" />
                    </div>
                )}

                {/* Capacity Info */}
                <div className="flex flex-col gap-3 flex-1">
                    {capacity_students && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-500 uppercase">Students:</span>
                            <span className="text-lg font-black text-zinc-900">{capacity_students}</span>
                        </div>
                    )}
                    {capacity_equipment && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-500 uppercase">Equipment:</span>
                            <span className="text-lg font-black text-zinc-900">{capacity_equipment}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Footer (Bottom Bun) - Price Table & Action */}
            <div className="px-6 py-6 mt-auto border-t border-dashed border-zinc-100 bg-zinc-50/50 rounded-b-[2rem]">
                {/* Price Table */}
                <div className="mb-4 grid grid-cols-2 gap-4 text-center">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Per Student</span>
                        <span className="text-xl font-black text-zinc-900">
                            {currencySymbol}
                            {price_per_student}
                        </span>
                    </div>
                    {pph && (
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Per Hour</span>
                            <span className="text-xl font-black text-zinc-900">
                                {currencySymbol}
                                {pph}
                            </span>
                        </div>
                    )}
                </div>

                {/* Duration */}
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block text-center">
                    {duration_minutes} minutes
                </span>

                {/* Action Button */}
                <div className="flex items-center justify-between gap-4 mt-4">
                    <div className="flex-1 min-w-0">
                        {name && <p className="text-xs text-zinc-600 line-clamp-2 font-medium">{name}</p>}
                    </div>

                    <div className="relative w-14 h-14 shrink-0 transition-transform duration-300 group-hover:scale-110">
                        <Image
                            src="/ADR.webp"
                            alt="Go"
                            fill
                            className={`object-contain transition-all duration-500 ${isHovered ? "grayscale-0 opacity-100" : "grayscale opacity-30"}`}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export function SchoolPackageContainer({ packages, currencySymbol }: SchoolPackageContainerProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Group packages by category (using snake_case from Supabase)
    const groupedPackages = useMemo(() => {
        const groups: Record<string, SchoolPackage[]> = {};
        packages.forEach((pkg) => {
            const cat = pkg.category_equipment || "Other";
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(pkg);
        });
        return groups;
    }, [packages]);

    // Get sorted categories
    const categories = useMemo(() => {
        const groupKeys = Object.keys(groupedPackages);
        return groupKeys.sort((a, b) => {
            const configA = EQUIPMENT_CATEGORIES.find((c) => c.id === a);
            const configB = EQUIPMENT_CATEGORIES.find((c) => c.id === b);

            if (!configA && !configB) return a.localeCompare(b);
            if (!configA) return 1;
            if (!configB) return -1;
            return 0;
        });
    }, [groupedPackages]);

    if (categories.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-10 select-none pointer-events-none">
                <Image src="/ADR.webp" alt="Adrenalink" width={200} height={200} className="grayscale" />
                <div className="mt-6">
                    <span className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] block mb-2">No Packages</span>
                    <span className="text-sm font-bold uppercase tracking-[0.5em]">Available right now</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-6 md:gap-8 overflow-y-auto md:overflow-x-auto md:overflow-y-hidden p-1 justify-evenly">
            {categories.map((cat) => {
                const categoryPackages = groupedPackages[cat];
                const config = EQUIPMENT_CATEGORIES.find((c) => c.id === cat);
                const sportConfig = SPORTS_CONFIG.find((s) => s.id === cat);

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
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 ${
                                isSelected ? "bg-zinc-50 border-zinc-200 shadow-sm" : "bg-transparent border-transparent"
                            }`}
                        >
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors duration-300 ${
                                    isSelected ? "bg-white border-zinc-100" : "bg-zinc-50 border-zinc-100"
                                }`}
                            >
                                {sportConfig?.image ? (
                                    <Image
                                        src={sportConfig.image}
                                        alt={sportConfig.id}
                                        width={24}
                                        height={24}
                                        className="object-contain"
                                    />
                                ) : config?.icon ? (
                                    <config.icon className="w-6 h-6" />
                                ) : null}
                            </div>
                            <h3
                                className={`text-xl font-black uppercase tracking-tight transition-colors duration-300 ${
                                    isSelected ? "text-zinc-900" : "text-zinc-400"
                                }`}
                            >
                                {config?.name || cat}
                            </h3>
                            <span
                                className={`ml-auto text-xs font-bold px-2 py-1 rounded-lg transition-colors duration-300 ${
                                    isSelected ? "bg-zinc-200 text-zinc-900" : "bg-zinc-50 text-zinc-300"
                                }`}
                            >
                                {categoryPackages.length}
                            </span>
                        </div>

                        {/* Packages List */}
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
                                    <PackageCard pkg={pkg} currencySymbol={currencySymbol} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
