"use client";

import Image from "next/image";
import adrLogo from "@/public/ADR.webp";
import { motion } from "framer-motion";

interface SchoolHeaderContentProps {
    titleMain: React.ReactNode;
    titleSub: React.ReactNode;
    descriptionMain: string;
    descriptionSub: string;
    isExiting?: boolean;
}

/**
 * Reusable branding header content for School and Landing pages
 * Static branding (Logo + Name) loads immediately, while content animates
 */
export const SchoolHeaderContent = ({ 
    titleMain, 
    titleSub, 
    descriptionMain, 
    descriptionSub,
    isExiting = false
}: SchoolHeaderContentProps) => {
    const contentVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: -20, filter: "blur(10px)" }
    };

    return (
        <div className="space-y-8">
            {/* Sequential Branding Animation */}
            <div className="flex items-end gap-4 overflow-hidden h-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <Image src={adrLogo} alt="Adrenalink" width={48} height={48} className="rounded-md dark:invert" />
                </motion.div>
                
                <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: "circOut" }}
                    className="text-primary text-4xl leading-none font-black tracking-tighter uppercase"
                >
                    Adrenalink
                </motion.h1>
            </div>

            <div className="space-y-6">
                {/* Main Titles - Staggered after branding */}
                <motion.h2 
                    variants={contentVariants}
                    initial="initial"
                    animate={isExiting ? "exit" : "animate"}
                    transition={{ duration: 0.8, ease: "circOut", delay: 0.6 }}
                    className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight"
                >
                    {titleMain}
                    <br />
                    <span className="text-muted-foreground">{titleSub}</span>
                </motion.h2>

                {/* Sub Description - Final Sequential Entrance */}
                <motion.p 
                    variants={contentVariants}
                    initial="initial"
                    animate={isExiting ? "exit" : "animate"}
                    transition={{ duration: 0.8, ease: "circOut", delay: 0.8 }}
                    className="text-xl text-foreground/90 font-sans max-w-md tracking-wide"
                >
                    {descriptionMain} · <span className="text-muted-foreground/70">{descriptionSub}</span>
                </motion.p>
            </div>
        </div>
    );
};