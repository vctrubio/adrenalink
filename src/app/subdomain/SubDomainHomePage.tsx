"use client";

import Image from "next/image";
import { MapPin, Globe, Instagram, MessageCircle } from "lucide-react";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment"; 
import type { SchoolModel } from "@/backend/models/SchoolModel";
import type { SchoolPackageModel } from "@/backend/models/SchoolPackageModel";
import { WindToggle } from "@/src/components/themes/WindToggle";

// Style Constants
const SOCIAL_BUTTON_STYLE = "w-12 h-12 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-md hover:bg-black/60 text-white/70 hover:text-white transition-all border border-white/10";

interface SubDomainHomePageProps {
    school: SchoolModel;
    packages: SchoolPackageModel[];
}

export function SubDomainHomePage({ school }: SubDomainHomePageProps) {
    const { name, country, phone, websiteUrl, instagramUrl, equipmentCategories, username } = school.schema;
    
    const bannerUrl = "/beach-banner.jpg"; 
    const iconUrl = null; 
    
    const hasPhone = !!phone && phone.length > 5;
    const hasWebsite = !!websiteUrl && websiteUrl.length > 3;
    const hasInstagram = !!instagramUrl && instagramUrl.length > 3;
    const whatsappNumber = phone?.replace(/\D/g, "") || "";

    const categoryList = equipmentCategories ? equipmentCategories.split(",").map((cat) => cat.trim()) : [];

    return (
        <div className="h-screen bg-background flex flex-col items-center p-4 md:p-8 overflow-hidden">
            
            {/* Theme Toggle - Absolute Right */}
            <div className="absolute top-6 right-6 z-50 bg-card/80 backdrop-blur-md rounded-xl border border-border shadow-lg">
                <WindToggle compact={true} />
            </div>

            {/* Full Height Card Container */}
            <div className="w-full max-w-7xl flex-1 bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative">
                
                {/* 1. Banner Section */}
                <div className="relative w-full h-48 md:h-80 bg-muted group shrink-0">
                    <Image 
                        src={bannerUrl} 
                        alt={`${name} Banner`} 
                        fill
                        className="object-cover" 
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Location Badge */}
                    <div className="absolute top-6 right-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-sm font-bold text-white shadow-lg">
                            <MapPin size={16} className="text-primary" />
                            <span className="uppercase tracking-wide">{country}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Profile Info Bar */}
                <div className="relative px-6 md:px-10 pb-8 bg-[#0a0a0a] border-t border-white/5 shrink-0"> 
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                        
                        {/* Avatar - Bottom Left Overlap */}
                        <div className="-mt-16 md:-mt-20 z-10 flex-shrink-0">
                            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-blue-500 bg-[#0a0a0a] overflow-hidden shadow-2xl">
                                {iconUrl ? (
                                    <img src={iconUrl} alt={`${name} Icon`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                                        <AdranlinkIcon className="text-white" size={64} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name & Categories */}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-4 md:pb-4 gap-2">
                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none">
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
                                            className="px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-white/10 text-white/80 border border-white/5"
                                        >
                                            <Icon className="w-3 h-3 fill-current" />
                                            {config.name}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Social Icons */}
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

                {/* 3. Content Area (Future Packages) */}
                <div className="flex-1 bg-background/30 backdrop-blur-3xl overflow-y-auto custom-scrollbar flex flex-col items-center justify-center p-10 border-t border-white/5">
                    <div className="opacity-10 flex flex-col items-center gap-6 select-none pointer-events-none">
                        <AdranlinkIcon size={160} />
                        <div className="text-center">
                            <span className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] block mb-2">Packages</span>
                            <span className="text-sm font-bold uppercase tracking-[0.5em]">Content Repository</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
