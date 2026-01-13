"use client";

import Image from "next/image";
import { MapPin, Globe, Instagram, MessageCircle } from "lucide-react";
import type { SchoolWithPackages } from "@/supabase/server/subdomain";
import { getCurrencySymbol } from "@/supabase/db/currency";
import { motion } from "framer-motion";
import { SchoolPackageContainer } from "./SchoolPackageContainer";
import { UsernameBadge } from "@/src/components/school/UsernameBadge";

// Style Constants
const SOCIAL_BUTTON_STYLE =
    "w-12 h-12 flex items-center justify-center rounded-2xl bg-white/40 backdrop-blur-md hover:bg-white/60 text-zinc-600 hover:text-zinc-900 transition-all border border-zinc-200";

/**
 * Shared layout component for the School Landing Page
 */
export function SubDomainHomePage({ school, packages, assets }: SchoolWithPackages) {
    const {
        name,
        country,
        phone,
        website_url: websiteUrl,
        instagram_url: instagramUrl,
        currency,
        username,
        status,
    } = school;
    const { bannerUrl, iconUrl } = assets;
    const currencySymbol = getCurrencySymbol(currency);

    const hasPhone = !!phone && phone.length > 5;
    const hasWebsite = !!websiteUrl && websiteUrl.length > 3;
    const hasInstagram = !!instagramUrl && instagramUrl.length > 3;
    const whatsappNumber = phone?.replace(/\D/g, "") || "";

    return (
        <div className="light min-h-screen h-full bg-[#f8f9fa] flex flex-col items-center p-4 md:p-8 text-zinc-900 overflow-hidden">
            {/* Main Portal Container */}
            <div className="w-full max-w-[1600px] flex-1 bg-white border border-zinc-200 rounded-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden">
                {/* 1. Banner Section */}
                <div className="relative w-full h-64 md:h-96 shrink-0 rounded-t-[2.5rem] overflow-hidden border-b border-zinc-200">
                    {bannerUrl ? (
                        <Image
                            src={bannerUrl}
                            alt={`${name} Banner`}
                            fill
                            className="object-cover"
                            priority
                            placeholder="blur"
                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <UsernameBadge username={username} />
                </div>

                {/* 2. Profile Info Bar */}
                <div className="relative px-6 md:px-10 pt-2 pb-4 bg-zinc-50 shrink-0 border-b border-zinc-100">
                    <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-2">
                        {/* School Icon */}
                        <div className="z-10 flex-shrink-0">
                            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full  overflow-hidden shadow-xl">
                                <Image src="/prototypes/north-icon.png" alt={`${name} Icon`} fill className="object-cover" />
                            </div>
                        </div>

                        {/* Name & Location */}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-2">
                            <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tighter leading-none uppercase">
                                {name}
                            </h1>

                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                <motion.span
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.4, ease: "backOut" }}
                                    className="px-4 py-2 rounded-lg text-sm md:text-base font-bold uppercase tracking-wider flex items-center gap-2 bg-white text-zinc-600"
                                >
                                    <MapPin className="w-5 h-5 text-secondary" />
                                    {country}
                                </motion.span>
                                {status && (
                                    <motion.span
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25, duration: 0.4, ease: "backOut" }}
                                        className={`px-4 py-2 rounded-lg text-sm md:text-base font-bold uppercase tracking-wider ${
                                            status.toLowerCase() === "beta"
                                                ? "bg-orange-50 text-orange-600"
                                                : "bg-white text-zinc-600"
                                        }`}
                                    >
                                        {status}
                                    </motion.span>
                                )}
                            </div>
                        </div>

                        {/* Social Links */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5, ease: "backOut" }} className="flex gap-2.5 md:mb-4 flex-shrink-0">
                            {hasPhone && (
                                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className={SOCIAL_BUTTON_STYLE}>
                                    <MessageCircle size={20} />
                                </a>
                            )}
                            {hasInstagram && (
                                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={SOCIAL_BUTTON_STYLE}>
                                    <Instagram size={20} />
                                </a>
                            )}
                            {hasWebsite && (
                                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className={SOCIAL_BUTTON_STYLE}>
                                    <Globe size={20} />
                                </a>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* 3. Package Content Area - Board Layout */}
                <div className="flex-1 min-h-0 bg-white/50 backdrop-blur-3xl flex flex-col overflow-hidden">
                    <div className="flex-1 p-6 md:p-8 overflow-hidden min-h-0">
                        <SchoolPackageContainer packages={packages} currencySymbol={currencySymbol} />
                    </div>
                </div>
            </div>
        </div>
    );
}
