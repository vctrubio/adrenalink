"use client";

import { useMemo } from "react";
import type { SchoolFormData } from "./WelcomeSchoolSteps";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import adrLogo from "@/public/ADR.webp";
import { SchoolProfileLayout } from "@/src/components/school/SchoolProfileLayout";

interface WelcomeHeaderProps {
    formData: SchoolFormData;
    showPreview: boolean;
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
            <h1 className="text-4xl font-bold text-foreground mb-2">Adrenalink</h1>
            <p className="text-lg md:text-xl text-muted-foreground">Register your school here.</p>
        </motion.div>
    );
}

function SchoolPreview({ formData, bannerUrl, iconUrl }: { formData: SchoolFormData; bannerUrl: string; iconUrl: string | null }) {
    return (
        <motion.div
            key="preview"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            // We use the shared layout, but we remove the flex-1/min-h-screen parts since this is just a header preview
            className="w-full"
        >
            <SchoolProfileLayout
                name={formData.name || "Your School Name"}
                username={formData.username}
                country={formData.country || "Location"}
                phone={formData.phone}
                websiteUrl={formData.websiteUrl}
                instagramUrl={formData.instagramUrl}
                bannerUrl={bannerUrl}
                iconUrl={iconUrl}
                // We don't pass children here because the form is below this header, not inside it
                // We also don't pass status for the preview
                className="rounded-b-[2.5rem] md:rounded-[2.5rem] overflow-hidden" // Adjust rounding if needed
                showSocialPlaceholders={true}
            />
        </motion.div>
    );
}

export function WelcomeHeader({ formData, showPreview }: WelcomeHeaderProps) {
    const bannerUrl = useMemo(() => {
        if (formData.bannerFile) return URL.createObjectURL(formData.bannerFile);
        return "/kritaps_ungurs_unplash/forest.jpg";
    }, [formData.bannerFile]);

    const iconUrl = useMemo(() => {
        if (formData.iconFile) return URL.createObjectURL(formData.iconFile);
        return null;
    }, [formData.iconFile]);

    return (
        <div className="w-full mb-6 md:mb-8">
            <AnimatePresence mode="wait">
                {!showPreview ? (
                    <WelcomePlaceholder />
                ) : (
                    <SchoolPreview formData={formData} bannerUrl={bannerUrl} iconUrl={iconUrl} />
                )}
            </AnimatePresence>
        </div>
    );
}