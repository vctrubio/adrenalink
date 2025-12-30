"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { MapPin, Globe, Instagram, MessageCircle, Clock, Users } from "lucide-react";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment"; 
import type { SchoolModel } from "@/backend/models/SchoolModel";
import { WindToggle } from "@/src/components/themes/WindToggle";
import { SportSelection, SPORTS_CONFIG } from "@/src/components/ui/SportSelection";
import { motion, AnimatePresence } from "framer-motion";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { SchoolPackageType } from "@/drizzle/schema";
import { GoToAdranlink } from "@/src/components/ui/GoToAdranlink";

// Currency Mapping
const CURRENCY_MAP: Record<string, string> = {
    "USD": "$",
    "EUR": "€",
    "CHF": "CHF",
    "YEN": "¥"
};

// Style Constants
const SOCIAL_BUTTON_STYLE = "w-12 h-12 flex items-center justify-center rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-md hover:bg-white/60 dark:hover:bg-black/60 text-foreground/70 hover:text-foreground transition-all border border-border";

interface SubDomainHomePageProps {
    school: SchoolModel;
    packages: (SchoolPackageType & { bookingCount: number })[];
    assets?: {
        iconUrl: string | null;
        bannerUrl: string | null;
    };
}

/**
 * Premium Card for individual school packages
 */
const SchoolPackageCard = ({ pkg, currencySymbol }: { pkg: SchoolPackageType & { bookingCount: number }; currencySymbol: string }) => {
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

    // Filter packages and calculate counts
    const filteredPackages = useMemo(() => {
        if (!selectedSport) return packages;
        return packages.filter(pkg => pkg.categoryEquipment === selectedSport);
    }, [packages, selectedSport]);

    const sportCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        packages.forEach(pkg => {
            const cat = pkg.categoryEquipment;
            if (cat) counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }, [packages]);

    return (
        <div className="min-h-screen h-screen bg-background flex flex-col items-center p-4 md:p-8 overflow-hidden overscroll-none text-foreground">
            
            <div className="absolute top-6 right-6 z-50 bg-card/80 backdrop-blur-md rounded-xl border border-border shadow-lg">
                <WindToggle compact={true} />
            </div>

            <div className="w-full max-w-7xl flex-1 bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative">
                
                <div className="relative w-full h-48 md:h-80 group shrink-0">
                    <div className="absolute inset-0 bg-background/30 backdrop-blur-3xl flex items-center justify-center">
                        <div className="opacity-10">
                            <AdranlinkIcon size={120} />
                        </div>
                    </div>
                    
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
                        <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-sm font-bold text-white shadow-lg">
                            <MapPin size={16} className="text-primary" />
                            <span className="uppercase tracking-wide">{country}</span>
                        </div>
                    </div>
                </div>

                <div className="relative px-6 md:px-10 pb-8 bg-muted dark:bg-[#0a0a0a] shrink-0"> 
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                        
                        <div className="-mt-16 md:-mt-20 z-10 flex-shrink-0">
                            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-blue-500 bg-muted dark:bg-[#0a0a0a] overflow-hidden shadow-2xl">
                                {iconUrl ? (
                                    <img src={iconUrl} alt={`${name} Icon`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                                        <AdranlinkIcon className="text-white" size={64} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-4 md:pb-4 gap-2">
                            <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter leading-none uppercase">
                                {name}
                            </h1>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                {categoryList.map(cat => {
                                    const config = EQUIPMENT_CATEGORIES.find(c => c.id === cat);
                                    if (!config) return null;
                                    const Icon = config.icon;
                                    return (
                                        <span 
                                            key={cat}
                                            className="px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-muted dark:bg-white/10 text-foreground border border-border"
                                        >
                                            <Icon className="w-3 h-3 fill-current text-primary dark:text-white" />
                                            {config.name}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-2.5 md:mb-4 flex-shrink-0">
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
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-background/30 backdrop-blur-3xl overflow-hidden flex flex-col">
                    <div className="p-6 md:p-10 flex flex-col gap-10 h-full">
                        
                        <div className="w-full max-w-2xl mx-auto shrink-0">
                            <SportSelection 
                                selectedSport={selectedSport} 
                                onSelectSport={setSelectedSport} 
                                counts={sportCounts}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 -mx-2 pb-10 overscroll-contain">
                            <AnimatePresence mode="popLayout">
                                {filteredPackages.length > 0 ? (
                                    <motion.div 
                                        key={selectedSport || "all"}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    >
                                        {filteredPackages.map((pkg) => (
                                            <SchoolPackageCard key={pkg.id} pkg={pkg} currencySymbol={currencySymbol} />
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="empty"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="h-full flex flex-col items-center justify-center text-center opacity-20 select-none pointer-events-none"
                                    >
                                        <AdranlinkIcon size={160} />
                                        <div className="mt-6">
                                            <span className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] block mb-2">No Packages</span>
                                            <span className="text-sm font-bold uppercase tracking-[0.5em]">For this category</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
