"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import adrLogo from "@/public/ADR.webp";
import { ChangeTheWindFooter } from "@/src/components/ui/ChangeTheWindFooter";
import { SportSelection, SPORTS_CONFIG } from "@/src/components/ui/SportSelection";

interface School {
    name: string;
    username: string;
    country: string;
    categories: string[];
    iconUrl: string;
    bannerUrl: string;
}

interface SchoolsClientProps {
    schools: School[];
}

/**
 * Sub-component for the branding header including sport selection
 */
const SchoolHeader = ({ 
    isStarting, 
    isNavigatingWelcome,
    selectedSport,
    onSelectSport
}: { 
    isStarting: boolean; 
    isNavigatingWelcome: boolean;
    selectedSport: string | null;
    onSelectSport: (id: string | null) => void;
}) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={isStarting || isNavigatingWelcome ? { opacity: 0, y: -100, filter: "blur(10px)", scale: 0.9 } : { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }} 
        transition={{ duration: 0.8, ease: "circOut" }} 
        className="mb-24"
    >
        <div className="flex flex-col gap-16">
            <div>
                <div className="flex items-end gap-4 mb-6">
                    <Image src={adrLogo} alt="Adrenalink" width={48} height={48} className="rounded-md dark:invert" />
                    <h1 className="text-primary text-4xl leading-none font-black tracking-tighter uppercase">Adrenalink</h1>
                </div>
                <h2 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight">
                    The Schools.
                    <br />
                    <span className="text-muted-foreground">The Network.</span>
                </h2>
                <p className="mt-6 text-xl text-foreground/90 font-sans max-w-md tracking-wide">
                    Home of Adrenaline Activities · <span className="text-muted-foreground/70">Find your Sport.</span>
                </p>
            </div>

            <div className="w-full max-w-2xl mx-auto">
                <SportSelection selectedSport={selectedSport} onSelectSport={onSelectSport} />
            </div>
        </div>
    </motion.div>
);

/**
 * Sub-component for individual school rows
 */
const SchoolRow = ({ 
    school, 
    index, 
    hoveredIndex, 
    setHoveredIndex,
    hoveredSportId,
    setHoveredSportId
}: { 
    school: School; 
    index: number; 
    hoveredIndex: number | null; 
    setHoveredIndex: (i: number | null) => void;
    hoveredSportId: string | null;
    setHoveredSportId: (id: string | null) => void;
}) => {
    const isRowHovered = hoveredIndex === index;

    return (
        <Link
            href={`https://${school.username}.adrenalink.tech`}
            target="_blank"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="group relative py-8 md:py-16 flex flex-col md:flex-row items-center gap-8 md:gap-16 transition-all px-12 rounded-[4rem] cursor-pointer overflow-hidden bg-card/30 hover:bg-card/60 border border-transparent hover:border-border/50 shadow-sm hover:shadow-2xl"
        >
            {/* Username Badge */}
            <div className="absolute top-0 right-0 z-20">
                <div className="bg-card px-8 py-3 rounded-bl-[2.5rem] border-b border-l border-border/50 flex items-center gap-3 shadow-sm">
                    <Image src={adrLogo} alt="" width={16} height={16} className="dark:invert" />
                    <span className="text-md font-black tracking-[0.4em] text-primary uppercase">{school.username}</span>
                </div>
            </div>

            {/* Banner Background */}
            <div className="absolute inset-0 z-0">
                <Image 
                    src={school.bannerUrl} 
                    alt="" 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-[0.15] group-hover:opacity-[0.3]" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
            </div>

            {/* School Icon */}
            <div className="relative z-10 w-32 h-32 md:w-48 md:h-48 flex-shrink-0 transition-all duration-700 rounded-full overflow-hidden shadow-2xl bg-background border-4 border-card">
                <Image src={school.iconUrl} alt={school.name} fill className="object-cover" />
            </div>

            {/* Name and Info */}
            <div className="relative z-10 flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                <h3 className="font-display text-5xl md:text-8xl font-black text-foreground tracking-tighter leading-none mb-8">
                    {school.name}
                </h3>
                <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-sm md:text-md opacity-40">
                    {school.country}
                </p>
            </div>

            {/* Sport Categories - Interactive Grid */}
            <div className="relative z-10 flex gap-4 md:gap-8">
                {SPORTS_CONFIG.filter(sport => school.categories.includes(sport.id)).map((sport) => {
                    const uniqueSportId = `${school.username}-${sport.id}`;
                    const isSportHovered = hoveredSportId === uniqueSportId;
                    
                    return (
                        <motion.div
                            key={sport.id}
                            onMouseEnter={() => setHoveredSportId(uniqueSportId)}
                            onMouseLeave={() => setHoveredSportId(null)}
                            layout
                            animate={{
                                width: isSportHovered ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 140 : 220) : (typeof window !== 'undefined' && window.innerWidth < 768 ? 72 : 96),
                                backgroundColor: isSportHovered ? "rgba(var(--secondary), 0.1)" : "rgba(255,255,255,0.03)"
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative h-16 md:h-24 rounded-[2.5rem] border border-border/30 overflow-hidden flex items-center gap-5 px-4 group/sport transition-colors duration-300 backdrop-blur-md"
                        >
                            <div className="relative w-8 h-8 md:w-12 md:h-12 shrink-0">
                                <Image
                                    src={sport.image}
                                    alt={sport.label}
                                    fill
                                    className={`object-contain transition-all duration-300 brightness-0 dark:invert ${isSportHovered || isRowHovered ? "opacity-100" : "opacity-20 grayscale"}`}
                                />
                            </div>
                            <AnimatePresence>
                                {isSportHovered && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="text-xs font-black uppercase tracking-widest text-foreground whitespace-nowrap"
                                    >
                                        {sport.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </Link>
    );
};const SchoolsClient = ({ schools }: SchoolsClientProps) => {
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

    const filteredSchools = useMemo(() => {
        if (!selectedSport) return schools;
        return schools.filter(school => school.categories.includes(selectedSport));
    }, [schools, selectedSport]);

    return (
        <section className="py-32 bg-background min-h-screen text-foreground">
            <motion.div 
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="container mx-auto px-4 mb-32"
            >
                <div className="max-w-6xl mx-auto relative">
                    <SchoolHeader 
                        isStarting={isStarting} 
                        isNavigatingWelcome={isNavigatingWelcome}
                        selectedSport={selectedSport}
                        onSelectSport={setSelectedSport}
                    />

                    <motion.div
                        className="space-y-6"
                        animate={isStarting || isNavigatingWelcome ? { opacity: 0, x: -100, filter: "blur(10px)" } : { opacity: 1, x: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.6 }}
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredSchools.length > 0 ? (
                                filteredSchools.map((school, index) => (
                                    <motion.div
                                        key={school.username}
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.5, ease: "circOut" }}
                                    >
                                        <SchoolRow 
                                            school={school}
                                            index={index}
                                            hoveredIndex={hoveredIndex}
                                            setHoveredIndex={setHoveredIndex}
                                            hoveredSportId={hoveredSportId}
                                            setHoveredSportId={setHoveredSportId}
                                        />
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-32 text-center"
                                >
                                    <p className="text-3xl font-black tracking-tighter text-muted-foreground">No schools found for this sport.</p>
                                    <button 
                                        onClick={() => setSelectedSport(null)}
                                        className="mt-6 text-primary hover:underline font-black uppercase tracking-[0.3em] text-xs"
                                    >
                                        Clear Filter
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </motion.div>

            <ChangeTheWindFooter 
                showFooter={showFooter}
                isStarting={isStarting}
                onGetStarted={() => setIsStarting(true)}
                variant="secondary"
            />
        </section>
    );
};

export default SchoolsClient;
