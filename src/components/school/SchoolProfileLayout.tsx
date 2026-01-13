"use client";

import Image from "next/image";
import { MapPin, Globe, Instagram, MessageCircle } from "lucide-react";
import { UsernameBadge } from "@/src/components/school/UsernameBadge";
import { motion } from "framer-motion";
import { ReactNode } from "react";

// Style Constants
const SOCIAL_BUTTON_STYLE =
    "w-12 h-12 flex items-center justify-center rounded-2xl bg-white/40 backdrop-blur-md hover:bg-white/60 text-zinc-600 hover:text-zinc-900 transition-all border border-zinc-200";

interface SchoolProfileLayoutProps {
    name: string;
    username: string;
    country: string;
    phone?: string;
    websiteUrl?: string;
    instagramUrl?: string;
    bannerUrl?: string | null;
    iconUrl?: string | null;
    status?: string; // Optional status (e.g., "beta")
    children?: ReactNode; // For package content or other elements
    className?: string;
    showSocialPlaceholders?: boolean; // If true, shows muted/faded icons for missing social links
}

/**
 * Shared layout component for School Profile Header and Content Container.
 * Used by SubDomainHomePage and WelcomeHeader for consistent styling.
 */
export function SchoolProfileLayout({
    name,
    username,
    country,
    phone,
    websiteUrl,
    instagramUrl,
    bannerUrl,
    iconUrl,
    status,
    children,
    className = "",
    showSocialPlaceholders = false,
}: SchoolProfileLayoutProps) {
    const hasPhone = !!phone && phone.length > 5;
    const hasWebsite = !!websiteUrl && websiteUrl.length > 3;
    const hasInstagram = !!instagramUrl && instagramUrl.length > 3;
    const whatsappNumber = phone?.replace(/\D/g, "") || "";

    const socialPlaceholderStyle = "opacity-30 cursor-not-allowed bg-zinc-100 hover:bg-zinc-100 text-zinc-400 border-zinc-100";

    return (
        <div className={`w-full max-w-[1600px] bg-white border border-zinc-200 rounded-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden ${className}`}>
            {/* 1. Banner Section */}
            <div className="relative w-full h-64 md:h-96 shrink-0 rounded-t-[2.5rem] overflow-hidden border-b border-zinc-200">
                {bannerUrl ? (
                    <Image
                        src={bannerUrl}
                        alt={`${name} Banner`}
                        fill
                        className="object-cover"
                        priority
                        // Add placeholder blur if it's a remote image, need to handle local/blob urls gracefully
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
                        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-xl bg-white">
                             {/* Fallback to default icon if not provided */}
                             <Image 
                                src={iconUrl || "/prototypes/north-icon.png"} 
                                alt={`${name} Icon`} 
                                fill 
                                className="object-cover" 
                            />
                        </div>
                    </div>

                    {/* Name & Location */}
                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-2">
                        <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tighter leading-none uppercase">
                            {name}
                        </h1>

                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            {country && (
                                <motion.span
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.4, ease: "backOut" }}
                                    className="px-4 py-2 rounded-lg text-sm md:text-base font-bold uppercase tracking-wider flex items-center gap-2 bg-white text-zinc-600"
                                >
                                    <MapPin className="w-5 h-5 text-secondary" />
                                    {country}
                                </motion.span>
                            )}
                            
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
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.4, duration: 0.5, ease: "backOut" }} 
                        className="flex gap-2.5 md:mb-4 flex-shrink-0"
                    >
                        {(hasPhone || showSocialPlaceholders) && (
                            <a 
                                href={hasPhone ? `https://wa.me/${whatsappNumber}` : undefined} 
                                target={hasPhone ? "_blank" : undefined} 
                                rel={hasPhone ? "noopener noreferrer" : undefined} 
                                className={`${SOCIAL_BUTTON_STYLE} ${!hasPhone ? socialPlaceholderStyle : ""}`}
                            >
                                <MessageCircle size={20} />
                            </a>
                        )}
                        {(hasInstagram || showSocialPlaceholders) && (
                            <a 
                                href={hasInstagram ? instagramUrl : undefined} 
                                target={hasInstagram ? "_blank" : undefined} 
                                rel={hasInstagram ? "noopener noreferrer" : undefined} 
                                className={`${SOCIAL_BUTTON_STYLE} ${!hasInstagram ? socialPlaceholderStyle : ""}`}
                            >
                                <Instagram size={20} />
                            </a>
                        )}
                        {(hasWebsite || showSocialPlaceholders) && (
                            <a 
                                href={hasWebsite ? websiteUrl : undefined} 
                                target={hasWebsite ? "_blank" : undefined} 
                                rel={hasWebsite ? "noopener noreferrer" : undefined} 
                                className={`${SOCIAL_BUTTON_STYLE} ${!hasWebsite ? socialPlaceholderStyle : ""}`}
                            >
                                <Globe size={20} />
                            </a>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* 3. Package Content Area - Board Layout (or Children) */}
            {children && (
                <div className="flex-1 min-h-0 bg-white/50 backdrop-blur-3xl flex flex-col overflow-hidden">
                    <div className="flex-1 p-6 md:p-8 overflow-hidden min-h-0">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}
