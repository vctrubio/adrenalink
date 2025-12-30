"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { MapPin, Globe, Instagram, MessageCircle } from "lucide-react";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import type { SchoolModel } from "@/backend/models/SchoolModel";
import { WindToggle } from "@/src/components/themes/WindToggle";
import { SportSelection } from "@/src/components/school/SportSelection";
import { SchoolPackageCard } from "@/src/components/school/SchoolPackageCard";
import { motion, AnimatePresence } from "framer-motion";
import type { SchoolPackageType } from "@/drizzle/schema";
import { ThemeProvider } from "next-themes";

// Currency Mapping
const CURRENCY_MAP: Record<string, string> = {
    USD: "$",
    EUR: "€",
    CHF: "CHF",
    YEN: "¥",
};

// Style Constants
const SOCIAL_BUTTON_STYLE = "w-12 h-12 flex items-center justify-center rounded-2xl bg-white/40 backdrop-blur-md hover:bg-white/60 text-zinc-600 hover:text-zinc-900 transition-all border border-zinc-200";

interface SubDomainHomePageProps {
    school: SchoolModel;
    packages: (SchoolPackageType & { bookingCount: number })[];
    assets?: {
        iconUrl: string | null;
        bannerUrl: string | null;
    };
}

/**
 * Shared layout component for the School Landing Page
 */
export function SubDomainHomePage({ school, packages, assets }: SubDomainHomePageProps) {
    const [selectedSport, setSelectedSport] = useState<string | null>(null);

    const { name, country, phone, websiteUrl, instagramUrl, equipmentCategories, currency } = school.schema;
    const currencySymbol = CURRENCY_MAP[currency] || CURRENCY_MAP["YEN"];

    const bannerUrl = assets?.bannerUrl || "/beach-banner.jpg";
    const iconUrl = assets?.iconUrl || null;

    const hasPhone = !!phone && phone.length > 5;
    const hasWebsite = !!websiteUrl && websiteUrl.length > 3;
    const hasInstagram = !!instagramUrl && instagramUrl.length > 3;
    const whatsappNumber = phone?.replace(/\D/g, "") || "";

    const categoryList = equipmentCategories ? equipmentCategories.split(",").map((cat) => cat.trim()) : [];


    // Filter categories to only show those with active packages
    const activeCategories = useMemo(() => {
        const categoriesWithPackages = new Set(packages.map((p) => p.categoryEquipment));
        return categoryList.filter((cat) => categoriesWithPackages.has(cat));
    }, [categoryList, packages]);

    // Filter packages and calculate counts
    const filteredPackages = useMemo(() => {
        if (!selectedSport) return packages;
        return packages.filter((pkg) => pkg.categoryEquipment === selectedSport);
    }, [packages, selectedSport]);

    const sportCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        packages.forEach((pkg) => {
            const cat = pkg.categoryEquipment;
            if (cat) counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }, [packages]);

    return (
        <div className="light min-h-screen h-full bg-[#f8f9fa] flex flex-col items-center p-4 md:p-8 text-zinc-900">
            {/* Main Portal Container */}
            <div className="w-full max-w-7xl flex-1 bg-white border border-zinc-200 rounded-[2.5rem] shadow-2xl flex flex-col relative">
                {/* 1. Banner Section */}
                <div className="relative w-full h-48 md:h-80 rounded-t-[2.5rem] overflow-hidden">
                    <Image
                        src={bannerUrl}
                        alt={`${name} Banner`}
                        fill
                        className="object-cover"
                        priority
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <div className="absolute top-6 right-6 z-10">
                        <div className="light flex items-center gap-2 px-4 py-2 bg-grey/40 backdrop-blur-md rounded-full border border-white/10 text-sm font-bold text-white shadow-lg">
                            <MapPin size={16} className="text-primary " />
                            <span className="uppercase tracking-wide">{country}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Profile Info Bar */}
                <div className="relative px-6 md:px-10 pb-8 bg-zinc-50 shrink-0">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                        {/* School Icon */}
                        <div className="-mt-16 md:-mt-20 z-10 flex-shrink-0">
                            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white bg-zinc-100 overflow-hidden shadow-2xl">
                                {iconUrl ? (
                                    <img src={iconUrl} alt={`${name} Icon`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                                        <AdranlinkIcon className="text-zinc-400" size={64} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name & Categories */}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-4 md:pb-4 gap-2">
                            <h1 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tighter leading-none uppercase">{name}</h1>

                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                {activeCategories.map((cat, index) => {
                                    const config = EQUIPMENT_CATEGORIES.find((c) => c.id === cat);
                                    if (!config) return null;
                                    const Icon = config.icon;
                                    return (
                                        <motion.span
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 + index * 0.1, duration: 0.4, ease: "backOut" }}
                                            key={cat}
                                            className="px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-zinc-100 text-zinc-700 border border-zinc-200"
                                        >
                                            <Icon className="w-3 h-3 fill-current text-primary" />
                                            {config.name}
                                        </motion.span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Social Links */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5, ease: "backOut" }} className="flex gap-2.5 md:mb-4 flex-shrink-0">
                            {hasPhone && (
                                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className={SOCIAL_BUTTON_STYLE}>
                                    <MessageCircle size={22} />
                                </a>
                            )}
                            {hasWebsite && (
                                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className={SOCIAL_BUTTON_STYLE}>
                                    <Globe size={22} />
                                </a>
                            )}
                            {hasInstagram && (
                                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={SOCIAL_BUTTON_STYLE}>
                                    <Instagram size={22} />
                                </a>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* 3. Package Content Area */}

                <div className="flex flex-col rounded-b-[2.5rem]">
                    <div className="p-6 md:p-10 flex flex-col gap-10 h-full">
                        {/* Centered Sport Selection */}
                        {packages.length > 0 && (
                            <div className="w-full max-w-2xl mx-auto shrink-0">
                                <SportSelection selectedSport={selectedSport} onSelectSport={setSelectedSport} counts={sportCounts} />
                            </div>
                        )}

                        {/* Animated Package Grid */}

                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={filteredPackages.length > 0 ? (selectedSport || "all") : "empty"}
                                initial={{ opacity: 0, y: filteredPackages.length > 0 ? 0 : 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: filteredPackages.length > 0 ? 0 : 20 }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                                className={
                                    filteredPackages.length > 0
                                        ? "flex-1 px-2 -mx-2 pb-10 rounded-b-[2.5rem] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                        : "flex-1 px-2 -mx-2 pb-10 rounded-b-[2.5rem] h-full flex flex-col items-center justify-center text-center opacity-10 select-none pointer-events-none"
                                }
                            >
                                {filteredPackages.length > 0 ? (
                                    filteredPackages.map((pkg) => (
                                        <SchoolPackageCard key={pkg.id} pkg={pkg} currencySymbol={currencySymbol} />
                                    ))
                                ) : (
                                    <>
                                        <Image src="/ADR.webp" alt="Adrenalink" width={200} height={200} className="grayscale" />
                                        <div className="mt-6">
                                            <span className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] block mb-2">No Packages</span>
                                            <span className="text-sm font-bold uppercase tracking-[0.5em]">For this category</span>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
