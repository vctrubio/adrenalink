"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { StatsExplainer, AdminDashboardPreview, BadgeShowcase, NavigationGuide } from "./steps";

const TOTAL_STEPS = 6;
const TOTAL_STEPS_SKIP_STATS = 5;

export default function Onboarding() {
    const searchParams = useSearchParams();
    const skipStats = searchParams?.get("skipStats") === "true";
    const [currentStep, setCurrentStep] = useState(0);

    const handlePageClick = () => {
        // When skipStats, max step is 5 (NavigationGuide). Without skipStats, max step is 5 (NavigationGuide)
        const maxStep = 5;
        if (currentStep < maxStep) {
            let nextStep = currentStep + 1;
            // If skipping stats, skip step 1 (FounderIntro) only
            if (skipStats && currentStep === 0) {
                nextStep = 2; // Skip from step 0 to step 2 (skip step 1)
            }
            setCurrentStep(nextStep);
            console.log("Current Step:", nextStep);
        }
    };

    const handleFounderClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handlePageClick();
    };

    return (
        <div className="min-h-screen bg-background flex flex-col cursor-pointer" onClick={handlePageClick}>
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
                {currentStep === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center gap-4 mb-16"
                    >
                        <div className="flex flex-row items-center gap-6">
                            <div className="relative w-24 h-24 flex-shrink-0">
                                <Image src="/ADR.webp" alt="Adrenalink Logo" fill className="object-contain" priority />
                            </div>
                            <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-foreground">Adrenalink</h1>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-xl font-bold text-muted-foreground tracking-tight uppercase">Administration Guide</p>
                            <div className="flex flex-col items-start gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <p className="text-sm font-medium text-muted-foreground/80">Learn the <strong>system design</strong></p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <p className="text-sm font-medium text-muted-foreground/80">Get <strong>comfortable</strong> with icons/entities</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <p className="text-sm font-medium text-muted-foreground/80"><strong>Register</strong> students, teachers and more</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {!skipStats && currentStep === 1 && <FounderIntro onClick={handleFounderClick} />}
                    {currentStep === 2 && <StatsExplainer />}
                    {currentStep === 3 && <AdminDashboardPreview />}
                    {currentStep === 4 && <BadgeShowcase />}
                    {currentStep === 5 && <NavigationGuide />}
                </AnimatePresence>
            </div>

            <div className="p-6 md:p-8 flex flex-col items-center gap-2">
                {currentStep === 5 && (
                    <p className="text-xs italic text-muted-foreground">
                        Thank you for listening.
                    </p>
                )}
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        {Array.from({ length: skipStats ? TOTAL_STEPS_SKIP_STATS : TOTAL_STEPS }).map((_, i) => {
                            // When skipStats, map: dot 0 -> step 0, dot 1 -> step 2, dot 2 -> step 3, dot 3 -> step 4, dot 4 -> step 5
                            let isActive = false;
                            if (skipStats) {
                                const stepMapping = [0, 2, 3, 4, 5];
                                isActive = stepMapping[i] <= currentStep;
                            } else {
                                isActive = i <= currentStep;
                            }
                            return (
                                <motion.div
                                    key={i}
                                    className={`h-2 w-8 rounded-full transition-colors ${isActive ? "bg-primary" : "bg-muted"}`}
                                    layout
                                />
                            );
                        })}
                    </div>
                    <p className="text-sm text-muted-foreground ml-2">
                        {(() => {
                            if (skipStats) {
                                // Map currentStep to display step: 0->1, 2->2, 3->3, 4->4, 5->5
                                const stepMapping: Record<number, number> = { 0: 1, 2: 2, 3: 3, 4: 4, 5: 5 };
                                return `Step ${stepMapping[currentStep] || 1} of ${TOTAL_STEPS_SKIP_STATS}`;
                            }
                            return `Step ${currentStep + 1} of ${TOTAL_STEPS}`;
                        })()}
                    </p>
                </div>
            </div>
        </div>
    );
}

function FounderIntro({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
    return (
        <motion.div
            initial={{ y: "100vh", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100vh", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-5xl cursor-pointer"
            onClick={onClick}
        >
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-2 border-border shadow-2xl">
                <Image src="/www.webp" alt="Founder" fill className="object-cover" priority />
            </div>
        </motion.div>
    );
}
