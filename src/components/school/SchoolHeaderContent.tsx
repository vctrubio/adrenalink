"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface SchoolHeaderContentProps {
    titleMain: React.ReactNode;
    titleSub: React.ReactNode;
    descriptionMain: string;
    descriptionSub: React.ReactNode;
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
    isExiting = false,
}: SchoolHeaderContentProps) => {
    const contentVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: -20, filter: "blur(10px)" },
    };

    return (
        <div className="space-y-8">
            {/* Sequential Branding Animation */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="overflow-hidden"
            >
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 transition-transform duration-300">
                        <Image 
                            src="/ADR.webp" 
                            alt="Adrenalink Logo" 
                            fill 
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-semibold text-primary tracking-wide">
                            Adrenalink
                        </h1>
                        <span className="text-sm text-muted-foreground font-mono tracking-wide uppercase">
                            Connecting Students
                        </span>
                    </div>
                </div>
            </motion.div>

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
