"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import adrLogo from "@/public/ADR.webp";
import { ENTITY_DATA } from "@/config/entities";
import { ChangeTheWindFooter } from "@/src/components/ui/ChangeTheWindFooter";

const pillarConfig = [
    {
        id: "student",
        number: "01",
        title: "Students",
        description: "Registration & tracking",
    },
    {
        id: "teacher",
        number: "02",
        title: "Teachers",
        description: "Hours & commissions",
    },
    {
        id: "booking",
        number: "03",
        title: "Bookings",
        description: "Smart scheduling",
    },
    {
        id: "equipment",
        number: "04",
        title: "Equipment",
        description: "Lifecycle management",
    },
    {
        id: "schoolPackage",
        number: "05",
        title: "Payments",
        description: "Set your prices",
    },
    {
        id: "rental",
        number: "06",
        title: "Rentals",
        description: "Equipment hire",
    },
];

const PillarsMinimal = () => {
    const [isStarting, setIsStarting] = useState(false);
    const [isNavigatingTeam, setIsNavigatingTeam] = useState(false);
    const [extraPillarsCount, setExtraPillarsCount] = useState(0);
    const [isMoreButtonVisible, setIsMoreButtonVisible] = useState(true);
    const [showFooter, setShowFooter] = useState(false);

    useEffect(() => {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const handleScroll = () => {
            const scrollY = window.scrollY;

            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (scrollY > lastScrollY && scrollY > 100) {
                        setShowFooter(true);
                    } else if (scrollY < lastScrollY) {
                        setShowFooter(false);
                    }

                    lastScrollY = scrollY;
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleGetStarted = () => {
        setIsStarting(true);
    };

    const handleMeetTeam = () => {
        setIsNavigatingTeam(true);
        setTimeout(() => {
            window.location.href = "/team";
        }, 800);
    };

    const handleTellMeMore = () => {
        if (extraPillarsCount < 2) {
            setExtraPillarsCount((prev) => prev + 1);
        } else {
            setIsMoreButtonVisible(false);
        }
    };

    return (
        <section className="py-32 bg-background">
            <motion.div 
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="container mx-auto px-4 mb-32"
            >
                <div className="max-w-5xl mx-auto relative">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={isStarting || isNavigatingTeam ? { opacity: 0, y: -100, filter: "blur(10px)", scale: 0.9 } : { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }} 
                        transition={{ duration: 0.8, ease: "circOut" }} 
                        className="mb-24"
                    >
                        <div className="flex items-end gap-4 mb-6">
                            <Image src={adrLogo} alt="Adrenalink" width={48} height={48} className="rounded-md dark:invert" />
                            <h1 className="text-primary text-4xl leading-none font-black tracking-tighter uppercase">Adrenalink</h1>
                        </div>
                        <h2 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight">
                            Four pillars.
                            <br />
                            <span className="text-muted-foreground">One platform.</span>
                        </h2>
                        <p className="mt-6 text-xl text-foreground/90 font-sans max-w-md tracking-wide">
                            Home of Adrenaline Activities · <span className="text-muted-foreground/70">An abnormal documentation for schools looking to get started</span>
                        </p>
                    </motion.div>

                    <motion.div
                        className="space-y-0"
                        animate={isStarting || isNavigatingTeam ? { opacity: 0, x: -100, filter: "blur(10px)" } : { opacity: 1, x: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.6 }}
                    >
                        <AnimatePresence>
                            {pillarConfig
                                .filter((_, i) => i < 4 + extraPillarsCount)
                                .map((pillar) => {
                                    const entity = ENTITY_DATA.find((e) => e.id === pillar.id);
                                    const Icon = entity ? entity.icon : null;
                                    const hasBorder = extraPillarsCount === 0;

                                    return (
                                        <motion.div
                                            key={pillar.id}
                                            initial={{ y: -80, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ type: "spring", stiffness: 120, damping: 14 }}
                                            className="group border-t border-border py-12 flex items-center gap-8 hover:bg-muted/30 transition-colors px-4 -mx-4 cursor-pointer"
                                        >
                                            <span className="text-5xl font-display font-bold text-muted-foreground/30 group-hover:text-primary/50 transition-colors w-20">{pillar.number}</span>

                                            <motion.div
                                                animate={{ borderRadius: hasBorder ? "9999px" : "0px" }}
                                                transition={{ duration: 0.3 }}
                                                className={`w-12 h-12 flex items-center justify-center transition-all ${hasBorder ? "border border-border group-hover:border-primary group-hover:bg-primary/5" : ""}`}
                                            >
                                                {Icon ? (
                                                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                ) : (
                                                    <Image src={adrLogo} alt={pillar.title} width={20} height={20} className="rounded-sm opacity-50 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </motion.div>

                                            <div>
                                                <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{pillar.title}</h3>
                                                <p className="text-muted-foreground">{pillar.description}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                        </AnimatePresence>
                        <div className="border-t border-border" />
                        {extraPillarsCount >= 2 && <div className="min-h-[8rem]" />}
                    </motion.div>
                </div>
            </motion.div>

            <ChangeTheWindFooter 
                showFooter={showFooter}
                isStarting={isStarting}
                onGetStarted={handleGetStarted}
                variant="primary"
                extraActions={
                    isMoreButtonVisible && (
                        <>
                            {extraPillarsCount < 2 ? (
                                <div onClick={handleTellMeMore} className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors group relative">
                                    <Plus className="w-5 h-5 group-hover:text-primary transition-colors" />
                                    <span className="font-medium">Tell me more</span>
                                    {extraPillarsCount > 0 && (
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                initial={{ scale: 0, opacity: 0, y: 5 }}
                                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                                exit={{ scale: 0, opacity: 0, y: -5 }}
                                                key={extraPillarsCount}
                                                className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                                            >
                                                {extraPillarsCount}
                                            </motion.span>
                                        </AnimatePresence>
                                    )}
                                </div>
                            ) : (
                                <button onClick={handleMeetTeam} className="px-6 py-3 rounded-full border border-transparent text-primary/70 hover:border-primary/40 hover:text-primary/70 transition-colors font-bold flex items-center gap-3">
                                    <span>Meet the team</span>
                                </button>
                            )}
                        </>
                    )
                }
            />
        </section>
    );
};

export default PillarsMinimal;
