"use client";

import { MapPin, Globe, Instagram, MessageCircle, Lock, RotateCcw, ArrowLeft, ArrowRight } from "lucide-react";
import type { SchoolFormData } from "./WelcomeSchoolSteps";
import { motion, AnimatePresence } from "framer-motion";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import Image from "next/image";
import adrLogo from "@/public/ADR.webp";

const AVATAR_SIZE = {
    small: "w-24 h-24",
    large: "md:w-32 md:h-32",
};

const ICON_SIZE = {
    small: "w-4 h-4",
    large: "w-5 h-5",
};

const SOCIAL_BUTTON_STYLE = "w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm hover:shadow-md";

interface WelcomeHeaderProps {
    formData: SchoolFormData;
    showPreview: boolean;
}

function BrowserBar({ displayUrl }: { displayUrl: string }) {
    return (
        <div className="bg-muted/80 backdrop-blur-md border-b border-border p-3 flex items-center gap-4 select-none">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>

            <div className="flex gap-2 text-muted-foreground hidden md:flex">
                <ArrowLeft className="w-4 h-4 opacity-50" />
                <ArrowRight className="w-4 h-4 opacity-50" />
                <RotateCcw className="w-3.5 h-3.5 opacity-70 hover:opacity-100 cursor-pointer" />
            </div>

            <div className="flex-1 bg-background/50 border border-border/50 rounded-md h-7 flex items-center px-3 gap-2 text-xs md:text-sm text-muted-foreground shadow-sm">
                <Lock className="w-3 h-3 text-green-600" />
                <span className="truncate font-mono">{displayUrl}</span>
            </div>

            <div className="hidden md:block">
                <div className="w-4 h-0.5 bg-muted-foreground/30 rounded-full mb-0.5" />
                <div className="w-4 h-0.5 bg-muted-foreground/30 rounded-full mb-0.5" />
                <div className="w-4 h-0.5 bg-muted-foreground/30 rounded-full" />
            </div>
        </div>
    );
}

function BannerSection({ bannerUrl }: { bannerUrl: string }) {
    return (
        <div className="relative w-full h-32 md:h-48 flex items-center justify-center bg-muted group">
            <div className="relative w-full h-full overflow-hidden">
                <img
                    src={bannerUrl}
                    alt="School Banner"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </div>
        </div>
    );
}

function SchoolIcon({ iconUrl }: { iconUrl: string | null }) {
    return (
        <div className="flex-shrink-0 z-10">
            <div className={`relative ${AVATAR_SIZE.small} ${AVATAR_SIZE.large}`}>
                <div className="w-full h-full rounded-full overflow-hidden shadow-lg bg-background flex items-center justify-center">
                    {iconUrl ? (
                        <img src={iconUrl} alt="School Icon" className="w-full h-full object-cover" />
                    ) : (
                        <Image src={adrLogo} alt="Adrenalink" width={60} height={60} className="dark:invert" />
                    )}
                </div>
            </div>
        </div>
    );
}

function SchoolInfo({ formData }: { formData: SchoolFormData }) {
    return (
        <div className="flex-1 text-center md:text-left space-y-1 z-10 ">
            <h3 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight drop-shadow-lg  md:text-foreground ">
                {formData.name || "Your School Name"}
            </h3>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                <span className="px-2 py-0.5 bg-muted/90 backdrop-blur-md rounded-full flex items-center gap-1.5 border border-border/50 shadow-sm">
                    <MapPin className={ICON_SIZE.small} />
                    {formData.country || "Location"}
                </span>

                <div className="flex flex-wrap gap-1.5">
                    {formData.equipmentCategories?.map((categoryId) => {
                        const config = EQUIPMENT_CATEGORIES.find((c) => c.id === categoryId);
                        if (!config) return null;
                        const Icon = config.icon;
                        return (
                            <span
                                key={categoryId}
                                className="px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold flex items-center gap-1 border shadow-sm backdrop-blur-sm"
                                style={{
                                    backgroundColor: `${config.color}15`,
                                    color: config.color,
                                    borderColor: `${config.color}30`,
                                }}
                            >
                                <Icon className="w-3 h-3" style={{ fill: config.color }} />
                                {config.name}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function SocialLinks({ hasPhone, hasWebsite, hasInstagram }: { hasPhone: boolean; hasWebsite: boolean; hasInstagram: boolean }) {
    return (
        <div className="flex gap-2 md:mb-2 z-10">
            <div
                className={`${SOCIAL_BUTTON_STYLE} ${hasPhone ? "bg-secondary/20 hover:bg-secondary/40 text-foreground cursor-pointer" : "bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed"}`}
            >
                <MessageCircle className={ICON_SIZE.large} />
            </div>

            <div
                className={`${SOCIAL_BUTTON_STYLE} ${hasWebsite ? "bg-secondary/20 hover:bg-secondary/40 text-foreground cursor-pointer" : "bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed"}`}
            >
                <Globe className={ICON_SIZE.large} />
            </div>

            <div
                className={`${SOCIAL_BUTTON_STYLE} ${hasInstagram ? "bg-secondary/20 hover:bg-secondary/40 text-foreground cursor-pointer" : "bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed"}`}
            >
                <Instagram className={ICON_SIZE.large} />
            </div>
        </div>
    );
}

function WelcomePlaceholder() {
    return (
        <motion.div
            key="placeholder"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center py-10"
        >
            <div className="flex justify-center mb-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Image src={adrLogo} alt="Adrenalink" width={160} height={160} className="dark:invert" priority />
                </motion.div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">Start Your Adventure</h1>
            <p className="text-lg md:text-xl text-muted-foreground">Register your school here.</p>
        </motion.div>
    );
}

function SchoolPreview({
    formData,
    bannerUrl,
    iconUrl,
    displayUrl,
    hasPhone,
    hasWebsite,
    hasInstagram,
}: {
    formData: SchoolFormData;
    bannerUrl: string;
    iconUrl: string | null;
    displayUrl: string;
    hasPhone: boolean;
    hasWebsite: boolean;
    hasInstagram: boolean;
}) {
    return (
        <motion.div
            key="preview"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="rounded-xl overflow-hidden border border-border bg-background shadow-lg"
        >
            <BrowserBar displayUrl={displayUrl} />
            <BannerSection bannerUrl={bannerUrl} />
            <div className="relative px-4 pb-6 -mt-12 md:-mt-16 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
                <SchoolIcon iconUrl={iconUrl} />
                <SchoolInfo formData={formData} />
                <SocialLinks hasPhone={hasPhone} hasWebsite={hasWebsite} hasInstagram={hasInstagram} />
            </div>
        </motion.div>
    );
}

export function WelcomeHeader({ formData, showPreview }: WelcomeHeaderProps) {
    const bannerUrl = formData.bannerFile ? URL.createObjectURL(formData.bannerFile) : "/kritaps_ungurs_unplash/forest.jpg";
    const iconUrl = formData.iconFile ? URL.createObjectURL(formData.iconFile) : null;

    const hasPhone = !!formData.phone && formData.phone.length > 5;
    const hasWebsite = !!formData.websiteUrl && formData.websiteUrl.length > 3;
    const hasInstagram = !!formData.instagramUrl && formData.instagramUrl.length > 3;

    const displayUrl = `https://${formData.username || "username"}.adrenalink.tech`;

    return (
        <div className="w-full mb-6 md:mb-8">
            <AnimatePresence mode="wait">
                {!showPreview ? (
                    <WelcomePlaceholder />
                ) : (
                    <SchoolPreview
                        formData={formData}
                        bannerUrl={bannerUrl}
                        iconUrl={iconUrl}
                        displayUrl={displayUrl}
                        hasPhone={hasPhone}
                        hasWebsite={hasWebsite}
                        hasInstagram={hasInstagram}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
