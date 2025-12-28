"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import { WindToggle } from "@/src/components/themes/WindToggle";
import { ENTITY_DATA } from "@/config/entities";
import { SpinAdranalink } from "@/src/components/ui/SpinAdranalink";

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
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const [extraPillarsCount, setExtraPillarsCount] = useState(0);
    const [isMoreButtonVisible, setIsMoreButtonVisible] = useState(true);

    const handleGetStarted = () => {
        console.log("action-user-click-started");
        setIsStarting(true);
        setTimeout(() => {
            window.location.reload();
        }, 800);
    };

    const handleTellMeMore = () => {
        if (extraPillarsCount < 2) {
            setExtraPillarsCount((prev) => prev + 1);
        } else {
            console.log("finish");
            setIsMoreButtonVisible(false);
        }
    };

    return (
        <section className="py-32 bg-background">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto relative">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={isStarting ? { opacity: 0, y: -100, filter: "blur(10px)", scale: 0.9 } : { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }} transition={{ duration: 0.8, ease: "circOut" }} className="mb-24">
                        <div className="flex items-center gap-2 mb-4">
                            <AdranlinkIcon className="text-primary w-6 h-6" />
                            <p className="text-primary font-mono text-sm">Adrenalink</p>
                        </div>
                        <h2 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight">
                            Four pillars.
                            <br />
                            <span className="text-muted-foreground">One platform.</span>
                        </h2>
                        <p className="mt-6 text-xl text-muted-foreground font-display">Home of Adrenaline Activities</p>
                    </motion.div>

                    {/* Pillars list */}
                    <div className="space-y-0">
                        <AnimatePresence>
                            {pillarConfig
                                .filter((_, i) => i < 4 + extraPillarsCount)
                                .map((pillar, index) => {
                                    const entity = ENTITY_DATA.find((e) => e.id === pillar.id);
                                    const Icon = entity ? entity.icon : AdranlinkIcon;
                                    const hasBorder = extraPillarsCount === 0;

                                    return (
                                        <motion.div
                                            key={pillar.id}
                                            initial={{ y: -80, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ type: "spring", stiffness: 120, damping: 14 }}
                                            className="group border-t border-border py-12 flex items-center gap-8 hover:bg-muted/30 transition-colors px-4 -mx-4 cursor-pointer"
                                        >
                                            {/* Number */}
                                            <span className="text-5xl font-display font-bold text-muted-foreground/30 group-hover:text-primary/50 transition-colors w-20">{pillar.number}</span>

                                            {/* Icon */}
                                            <motion.div
                                                animate={{
                                                    borderRadius: hasBorder ? "9999px" : "0px",
                                                }}
                                                transition={{ duration: 0.3 }}
                                                className={`w-12 h-12 flex items-center justify-center transition-all ${hasBorder ? "border border-border group-hover:border-primary group-hover:bg-primary/5" : ""}`}
                                            >
                                                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </motion.div>

                                            {/* Content */}
                                            <div>
                                                <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{pillar.title}</h3>
                                                <p className="text-muted-foreground">{pillar.description}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                        </AnimatePresence>
                        <div className="border-t border-border" />
                    </div>

                    {/* Footer */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={isStarting ? { opacity: 0, y: -100, filter: "blur(10px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.6 }} className="mt-24 flex items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={handleGetStarted}
                                onMouseEnter={() => setIsButtonHovered(true)}
                                onMouseLeave={() => setIsButtonHovered(false)}
                                className="px-6 py-3 rounded-full border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors font-medium flex items-center gap-3"
                            >
                                <SpinAdranalink isSpinning={isStarting || isButtonHovered} duration={isStarting ? 0.3 : 0.8} size={20} />
                                <span>Get Started</span>
                            </button>

                            <div className="px-6 py-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors group flex items-center gap-3 font-bold">
                                <AdminIcon className="w-5 h-5" />
                                <span>Register as a School</span>
                            </div>

                            {isMoreButtonVisible && (
                                <>
                                    {extraPillarsCount < 2 ? (
                                        <div onClick={handleTellMeMore} className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors group relative">
                                            <Plus className="w-5 h-5 group-hover:text-primary transition-colors" />
                                            <span className="font-medium">Tell me more</span>

                                            {/* Counter Badge */}
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
                                        <a href="/docs/manual" className="px-6 py-3 rounded-full border border-transparent text-primary/70 hover:border-primary/40 hover:text-primary/70 transition-colors font-bold flex items-center gap-3">
                                            <span>Meet the team</span>
                                        </a>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-muted-foreground text-sm">Change the wind</span>
                            <WindToggle />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default PillarsMinimal;
