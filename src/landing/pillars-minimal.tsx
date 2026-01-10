"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ENTITY_DATA } from "@/config/entities";
import { ChangeTheWindFooter } from "@/src/components/ui/ChangeTheWindFooter";
import { SchoolHeaderContent } from "@/src/components/school/SchoolHeaderContent";
import { SchoolPageLayout } from "@/src/app/discover/SchoolPageLayout";

const pillarConfig = [
    { id: "student", number: "01", title: "Students", description: "Registration & tracking" },
    { id: "teacher", number: "02", title: "Teachers", description: "Hours & commissions" },
    { id: "booking", number: "03", numberAlt: "03", title: "Bookings", description: "Smart scheduling" },
    { id: "equipment", number: "04", title: "Equipment", description: "Lifecycle management" },
    { id: "schoolPackage", number: "05", title: "Payments", description: "Set your prices" },
    { id: "rental", number: "06", title: "Rentals", description: "Equipment hire" },
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
                    if (scrollY > lastScrollY && scrollY > 100) setShowFooter(true);
                    else if (scrollY < lastScrollY) setShowFooter(false);
                    lastScrollY = scrollY;
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleTellMeMore = () => {
        if (extraPillarsCount < 2) setExtraPillarsCount((prev) => prev + 1);
        else setIsMoreButtonVisible(false);
    };

    const isExiting = isStarting || isNavigatingTeam;

    return (
        <SchoolPageLayout
            isStarting={isStarting}
            isNavigatingOther={isNavigatingTeam}
            header={
                <SchoolHeaderContent
                    titleMain="Four pillars."
                    titleSub="One platform."
                    descriptionMain="Home of Adrenaline Activities"
                    descriptionSub="An abnormal documentation for schools looking to get started"
                    isExiting={isExiting}
                />
            }
            footer={
                <ChangeTheWindFooter
                    showFooter={showFooter}
                    isStarting={isStarting}
                    onGetStarted={() => setIsStarting(true)}
                    variant="primary"
                    getStartedUrl="/discover"
                    extraActions={
                        isMoreButtonVisible && (
                            <>
                                {extraPillarsCount < 2 ? (
                                    <div
                                        onClick={handleTellMeMore}
                                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors group relative"
                                    >
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
                                    <button
                                        onClick={() => {
                                            setIsNavigatingTeam(true);
                                            window.location.href = "/team";
                                        }}
                                        className="px-6 py-3 rounded-full border border-transparent text-primary/70 hover:border-primary/40 hover:text-primary/70 transition-colors font-bold flex items-center gap-3"
                                    >
                                        <span>Meet the team</span>
                                    </button>
                                )}
                            </>
                        )
                    }
                />
            }
        >
            <div className="space-y-0">
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
                                    <span className="text-5xl font-display font-bold text-muted-foreground/30 group-hover:text-primary/50 transition-colors w-20">
                                        {pillar.number}
                                    </span>
                                    <div
                                        className={`w-12 h-12 flex items-center justify-center transition-all ${hasBorder ? "border border-border group-hover:border-primary group-hover:bg-primary/5 rounded-full" : ""}`}
                                    >
                                        {Icon && (
                                            <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                                            {pillar.title}
                                        </h3>
                                        <p className="text-muted-foreground">{pillar.description}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                </AnimatePresence>
                <div className="border-t border-border" />
                {extraPillarsCount >= 2 && <div className="min-h-[8rem]" />}
            </div>
        </SchoolPageLayout>
    );
};

export default PillarsMinimal;
