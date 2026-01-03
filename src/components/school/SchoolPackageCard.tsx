"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { motion } from "framer-motion";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { SchoolPackageType } from "@/drizzle/schema";
import { SPORTS_CONFIG } from "./SportSelection";
import { ChalkboardTable } from "@/src/components/ui/ChalkboardTable";

interface SchoolPackageCardProps {
    pkg: SchoolPackageType & { bookingCount: number };
    currencySymbol: string;
}

/**
 * Game-style Package Card
 * Layout: Header (Title) -> Body (Stats) -> Footer (Price & Action)
 */
export const SchoolPackageCard = ({ pkg, currencySymbol }: SchoolPackageCardProps) => {
    const { id, description, pricePerStudent, durationMinutes, categoryEquipment, capacityStudents, capacityEquipment } = pkg;
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();
    
    const sportConfig = SPORTS_CONFIG.find(s => s.id === categoryEquipment);

    // Determine type and color theme
    const isRental = pkg.packageType?.toLowerCase().includes("rental");
    const typeBg = isRental ? "bg-red-50" : "bg-blue-50";
    const typeText = isRental ? "text-red-clade" : "text-blue-clude";
    const typeBorder = isRental ? "border-red-clade" : "border-blue-clude";

    // Calculate PPH if duration != 1hr (60 mins)
    const pph = durationMinutes !== 60 ? Math.round(pricePerStudent / (durationMinutes / 60)) : null;

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
                    {description}
                </h4>
                {/* Type Badge */}
                <span className={`
                    shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                    ${isRental ? "bg-red-50 text-red-clade border-red-100" : "bg-blue-50 text-blue-clude border-blue-100"}
                `}>
                    {pkg.packageType}
                </span>
            </div>

            {/* 2. Middle (Patty) - Stats Grid (Equipment & Capacity ONLY) */}
            <div className="flex-1 px-8 py-8 grid grid-cols-2 gap-y-8 gap-x-4">
                {/* Equipment Stat */}
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Equipment</span>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${isHovered ? typeBg : "bg-zinc-50"}`}>
                            {sportConfig ? (
                                <Image 
                                    src={sportConfig.image} 
                                    alt="" 
                                    width={24} 
                                    height={24} 
                                    className={`object-contain transition-all duration-300 ${isHovered ? "brightness-0 opacity-100" : "brightness-0 opacity-30"}`}
                                    style={{ filter: isHovered ? (isRental ? "invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)" : "invert(38%) sepia(74%) saturate(1638%) hue-rotate(202deg) brightness(101%) contrast(96%)") : undefined }}
                                />
                            ) : (
                                <AdranlinkIcon size={20} className="text-zinc-300" />
                            )}
                        </div>
                        <span className="text-2xl font-black text-zinc-900">x{capacityEquipment}</span>
                    </div>
                </div>

                {/* Student Stat */}
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Capacity</span>
                    <div className="flex items-center gap-3">
                        <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${isHovered ? typeBg : "bg-zinc-50"}`}>
                            <HelmetIcon size={20} className={`transition-colors duration-300 ${isHovered ? typeText : "text-zinc-300"}`} />
                            
                            {/* Capacity Badge - Colored based on type */}
                            {capacityStudents > 0 && (
                                <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white transition-colors duration-300 ${isRental ? "bg-red-clade text-white" : "bg-blue-clude text-white"}`}>
                                    {capacityStudents}
                                </div>
                            )}
                        </div>
                        <span className="text-2xl font-black text-zinc-900">x{capacityStudents}</span>
                    </div>
                </div>
            </div>

            {/* 3. Footer (Bottom Bun) - Chalkboard Table & Action */}
            <div className="px-6 py-6 mt-auto flex items-center justify-between gap-6 border-t border-dashed border-zinc-100 bg-zinc-50/50 rounded-b-[2rem]">
                <div className="flex-1">
                    <ChalkboardTable 
                        duration={getPrettyDuration(durationMinutes)} 
                        price={pricePerStudent} 
                        pph={pph} 
                        currency={currencySymbol} 
                    />
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
        </motion.div>
    );
};
