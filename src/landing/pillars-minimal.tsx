"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ENTITY_DATA } from "@/config/entities";
import { STAT_TYPE_CONFIG } from "@/backend/data/StatsData";
import { ChangeTheWindFooter } from "@/src/components/ui/ChangeTheWindFooter";
import { SchoolHeaderContent } from "@/src/components/school/SchoolHeaderContent";
import { SchoolPageLayout } from "@/src/app/discover/SchoolPageLayout";
import { StatsPreview } from "@/src/components/onboarding/steps/StatsPreview";

const pillarConfig = [
    { id: "student", number: "01", title: "Students", description: "Registration & tracking" },
    { id: "teacher", number: "02", title: "Teachers", description: "Hours & commissions" },
    { id: "equipment", number: "03", title: "Equipment", description: "Lifecycle management" },
    { id: "package", number: "04", title: "Packages", description: "Set your prices" },
    { id: "booking", number: "05", title: "Bookings", description: "Smart scheduling" },
];


const PillarsMinimal = () => {
    const [isStarting, setIsStarting] = useState(false);
    const [isNavigatingTeam, setIsNavigatingTeam] = useState(false);
    const [showFooter, setShowFooter] = useState(false);
    const [titleMain, setTitleMain] = useState("Five pillars.");
    const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

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

    const togglePillar = (id: string) => {
        setExpandedPillar(expandedPillar === id ? null : id);
    };

    const isExiting = isStarting || isNavigatingTeam;

    return (
        <SchoolPageLayout
            isStarting={isStarting}
            isNavigatingOther={isNavigatingTeam}
            header={
                <SchoolHeaderContent
                    titleMain={
                        <span
                            key={titleMain}
                            className="inline-block transition-all duration-500 ease-in-out opacity-100 translate-y-0 will-change-transform"
                        >
                            {titleMain}
                        </span>
                    }
                    titleSub="One platform."
                    descriptionMain="Home of Adrenaline Activities"
                    descriptionSub={
                        <Link href="/onboarding" className="hover:underline">
                            An abnormal documentation for schools looking to get started
                        </Link>
                    }
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
                    getStartedText="Find A School"
                    registerUrl="/welcome"
                />
            }
        >
            <div className="space-y-0">
                <AnimatePresence>
                    {pillarConfig.map((pillar) => {
                        const config = STAT_TYPE_CONFIG[pillar.id as keyof typeof STAT_TYPE_CONFIG] || STAT_TYPE_CONFIG.students;
                        const isExpanded = expandedPillar === pillar.id;

                        return (
                            <motion.div
                                key={pillar.id}
                                initial={{ y: -80, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                                className="group border-t border-border overflow-hidden"
                            >
                                <div 
                                    onClick={() => togglePillar(pillar.id)}
                                    className="py-12 flex items-center gap-8 hover:bg-muted/30 transition-colors px-4 -mx-4 cursor-pointer"
                                    onMouseEnter={(e) => {
                                        const iconDiv = e.currentTarget.querySelector('[data-icon-container]') as HTMLElement;
                                        if (iconDiv) {
                                            if (!iconDiv.dataset.originalBorder) {
                                                iconDiv.dataset.originalBorder = getComputedStyle(iconDiv).borderColor;
                                            }
                                            iconDiv.style.borderColor = config.color;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        const iconDiv = e.currentTarget.querySelector('[data-icon-container]') as HTMLElement;
                                        if (iconDiv && iconDiv.dataset.originalBorder && !isExpanded) {
                                            iconDiv.style.borderColor = iconDiv.dataset.originalBorder;
                                        }
                                    }}
                                >
                                    <span className="text-5xl font-display font-bold text-muted-foreground/30 group-hover:text-primary/50 transition-colors w-20">
                                        {pillar.number}
                                    </span>
                                    <div>
                                        <div
                                            data-icon-container
                                            className="w-12 h-12 flex items-center justify-center rounded-2xl shadow-sm border border-border/50 transition-all"
                                            style={{ color: isExpanded ? config.color : undefined }}
                                        >
                                            <config.icon size={22} className={`transition-colors ${!isExpanded ? "text-muted-foreground group-hover:text-current" : ""}`} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-display text-2xl font-bold transition-colors ${isExpanded ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                                            {pillar.title}
                                        </h3>
                                        <p className="text-muted-foreground">{pillar.description}</p>
                                    </div>
                                    <div className="shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors pr-4">
                                        {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-6 pt-8 pb-16 bg-muted/10 border-b border-border/30"
                                        >
                                            <div className="pl-0 lg:pl-36">
                                                <StatsPreview pillarId={pillar.id} showDescription={true} />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div className="border-t border-border" />
                <div className="min-h-[8rem]" />
            </div>
        </SchoolPageLayout>
    );
};

export default PillarsMinimal;
