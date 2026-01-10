"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SchoolWithAssets } from "@/supabase/db/types";
import { ChangeTheWindFooter } from "@/src/components/ui/ChangeTheWindFooter";
import { SportSelection } from "@/src/components/school/SportSelection";
import { SchoolIdentificationRow } from "@/src/app/discover/SchoolIdentificationRow";
import { SchoolHeaderContent } from "@/src/components/school/SchoolHeaderContent";

const SchoolsClient = ({ schools }: { schools: SchoolWithAssets[] }) => {
    const [isStarting, setIsStarting] = useState(false);
    const [isNavigatingWelcome, setIsNavigatingWelcome] = useState(false);
    const [showFooter, setShowFooter] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [selectedSport, setSelectedSport] = useState<string | null>(null);
    const [hoveredSportId, setHoveredSportId] = useState<string | null>(null);

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

    const filteredSchools = useMemo(() => {
        if (!selectedSport) return schools;
        return schools.filter((school) => {
            if (!school.equipment_categories || school.equipment_categories.trim() === "") {
                console.warn(`⚠️ School "${school.name}" has no equipment_categories`);
                return false;
            }
            const categories = school.equipment_categories
                .split(",")
                .map((c) => c.trim())
                .filter((c) => c);
            return categories.includes(selectedSport);
        });
    }, [schools, selectedSport]);

    const isExiting = isStarting || isNavigatingWelcome;

    return (
        <section className="py-32 bg-background min-h-screen text-foreground overflow-hidden">
            <div className="container mx-auto px-4 mb-32">
                <div className="max-w-6xl mx-auto relative">
                    {/* Header Container - Static branding inside, animated sub-content */}
                    <div className="mb-24">
                        <div className="flex flex-col gap-16">
                            <SchoolHeaderContent titleMain="The Schools." titleSub="The Network." descriptionMain="Home of Adrenaline Activities" descriptionSub="Find your next school." isExiting={isExiting} />
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={isExiting ? { opacity: 0, y: -20, filter: "blur(10px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.6, delay: 0.2 }} className="w-full max-w-2xl mx-auto">
                                <SportSelection selectedSport={selectedSport} onSelectSport={setSelectedSport} />
                            </motion.div>
                        </div>
                    </div>

                    {/* Content with entrance and exit animation */}
                    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={isExiting ? { opacity: 0, x: -100, filter: "blur(10px)" } : { opacity: 1, x: 0, filter: "blur(0px)", scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                        <div className="space-y-6">
                            <AnimatePresence mode="popLayout">
                                {filteredSchools.length > 0 ? (
                                    filteredSchools.map((school, index) => (
                                        <motion.div key={school.username} initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 120, damping: 14 }}>
                                            <SchoolIdentificationRow school={school} index={index} hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} hoveredSportId={hoveredSportId} setHoveredSportId={setHoveredSportId} />
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center">
                                        <p className="text-3xl font-black tracking-tighter text-muted-foreground">No schools found.</p>
                                        <button onClick={() => setSelectedSport(null)} className="mt-6 text-primary hover:underline font-black uppercase tracking-[0.3em] text-xs">
                                            Clear Filter
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>

            <ChangeTheWindFooter showFooter={showFooter} isStarting={isStarting} onGetStarted={() => setIsStarting(true)} variant="secondary" getStartedUrl="/pillars" />
        </section>
    );
};

export default SchoolsClient;
