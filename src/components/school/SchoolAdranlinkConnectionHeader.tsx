"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import AdminIcon from "@/public/appSvgs/AdminIcon";

interface SchoolAdranlinkConnectionHeaderProps {
    schoolName: string;
    username: string;
    country: string;
    timezone: string | null;
    currency: string;
    eventId?: string;
    titleSub?: string;
    description?: React.ReactNode;
    hideEventId?: boolean;
    customBadges?: React.ReactNode;
}

export function SchoolAdranlinkConnectionHeader({
    schoolName,
    username,
    country,
    timezone,
    currency,
    eventId,
    titleSub = "The Adrenalink Connection",
    description = "Transparent tracking for both teachers and students.",
    hideEventId = false,
    customBadges
}: SchoolAdranlinkConnectionHeaderProps) {
    const containerVariants = {
        initial: { opacity: 0, y: -20 },
        animate: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="w-full space-y-6"
        >
            {/* 1. Branding Group */}
            <div className="flex items-start gap-5">
                <motion.div variants={itemVariants} className="mt-1 shrink-0">
                    <Image src="/ADR.webp" alt="Adrenalink" width={48} height={48} priority />
                </motion.div>
                <div className="flex flex-col gap-0.5">
                    <motion.h1 
                        variants={itemVariants} 
                        className="text-3xl md:text-4xl font-black tracking-tighter text-primary uppercase leading-none"
                    >
                        {schoolName}
                    </motion.h1>
                    <motion.h2 
                        variants={itemVariants}
                        className="text-lg font-bold tracking-tight text-foreground/90"
                    >
                        {titleSub}
                    </motion.h2>
                </div>
            </div>

            {/* 2. Main Headline */}
            <motion.h3 
                variants={itemVariants}
                className="text-3xl md:text-5xl font-black text-foreground leading-[1.1] tracking-tight max-w-2xl"
            >
                {description}
            </motion.h3>

            {/* 3. Metadata & Event ID */}
            <motion.div 
                variants={itemVariants}
                className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/40"
            >
                <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-2xl border border-border/50">
                    <div className="text-primary">
                        <AdminIcon size={20} />
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-foreground divide-x divide-border/50">
                        <span className="leading-none">{username}</span>
                        <span className="px-3 leading-none">{country}</span>
                        <span className="px-3 leading-none">{timezone || "UTC"}</span>
                        <span className="pl-3 leading-none text-primary">{currency}</span>
                    </div>
                </div>

                {customBadges ? customBadges : (
                    <>
                        {!hideEventId && eventId && (
                            <div className="px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-[10px] font-mono font-bold text-primary flex items-center gap-2">
                                <span className="opacity-60 uppercase tracking-widest text-[9px]">Event</span>
                                <span className="tracking-tight">{eventId}</span>
                            </div>
                        )}
                        
                        {hideEventId && (
                            <div className="px-4 py-2 rounded-2xl bg-muted/50 border border-border/50 text-[9px] uppercase font-black tracking-widest text-muted-foreground">
                                All my transactions
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}
