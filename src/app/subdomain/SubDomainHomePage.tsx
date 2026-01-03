"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { MapPin, Globe, Instagram, MessageCircle } from "lucide-react";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import type { SchoolModel } from "@/backend/models/SchoolModel";
import { WindToggle } from "@/src/components/themes/WindToggle";
import { motion } from "framer-motion";
import type { SchoolPackageType } from "@/drizzle/schema";
import { ThemeProvider } from "next-themes";
import { SchoolPackageBoard } from "@/src/components/school/SchoolPackageBoard";

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

    return (
        <div className="light min-h-screen h-full bg-[#f8f9fa] flex flex-col items-center p-4 md:p-8 text-zinc-900 overflow-hidden">
            {/* Main Portal Container */}
            <div className="w-full max-w-[1600px] flex-1 bg-white border border-zinc-200 rounded-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden">
                {/* 1. Banner Section */}
                <div className="relative w-full h-48 md:h-64 shrink-0 rounded-t-[2.5rem] overflow-hidden">
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
                        <div className="light flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-sm font-bold text-white shadow-lg">
                            <MapPin size={16} className="text-primary " />
                            <span className="uppercase tracking-wide">{country}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Profile Info Bar */}
                <div className="relative px-6 md:px-10 pb-6 bg-zinc-50 shrink-0 border-b border-zinc-100">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                        {/* School Icon */}
                        <div className="-mt-16 md:-mt-12 z-10 flex-shrink-0">
                            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-3xl border-[6px] border-white bg-zinc-100 overflow-hidden shadow-xl transform rotate-3">
                                {iconUrl ? (
                                    <img src={iconUrl} alt={`${name} Icon`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                                        <AdranlinkIcon className="text-zinc-400" size={56} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name & Categories */}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pb-4 gap-2">
                            <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tighter leading-none uppercase">{name}</h1>

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
                                            className="px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-white text-zinc-600 border border-zinc-200"
                                        >
                                            <Icon className="w-3 h-3 fill-current text-blue-500" />
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
                                    <MessageCircle size={20} />
                                </a>
                            )}
                            {hasWebsite && (
                                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className={SOCIAL_BUTTON_STYLE}>
                                    <Globe size={20} />
                                </a>
                            )}
                            {hasInstagram && (
                                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={SOCIAL_BUTTON_STYLE}>
                                    <Instagram size={20} />
                                </a>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* 3. Package Content Area - Board Layout */}
                <div className="flex-1 min-h-0 bg-white/50 backdrop-blur-3xl flex flex-col overflow-hidden">
                    <div className="flex-1 p-6 md:p-8 overflow-hidden min-h-0">
                        {packages.length > 0 ? (
                            <SchoolPackageBoard packages={packages} currencySymbol={currencySymbol} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-10 select-none pointer-events-none">
                                <Image src="/ADR.webp" alt="Adrenalink" width={200} height={200} className="grayscale" />
                                <div className="mt-6">
                                    <span className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] block mb-2">No Packages</span>
                                    <span className="text-sm font-bold uppercase tracking-[0.5em]">Available right now</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}