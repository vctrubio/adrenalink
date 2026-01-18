"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { StatsExplainer, AdminDashboardPreview, BadgeShowcase, NavigationGuide } from "./steps";

const TOTAL_STEPS = 6;

export default function Onboarding() {
    const [currentStep, setCurrentStep] = useState(0);

    const handlePageClick = () => {
        if (currentStep < TOTAL_STEPS - 1) {
            const nextStep = currentStep + 1;
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
                    {currentStep === 1 && <FounderIntro onClick={handleFounderClick} />}
                    {currentStep === 2 && <StatsExplainer />}
                    {currentStep === 3 && <AdminDashboardPreview />}
                    {currentStep === 4 && <BadgeShowcase />}
                    {currentStep === 5 && <NavigationGuide />}
                </AnimatePresence>
            </div>

            <div className="p-6 md:p-8 flex justify-center">
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                            <motion.div
                                key={i}
                                className={`h-2 w-8 rounded-full transition-colors ${i <= currentStep ? "bg-primary" : "bg-muted"}`}
                                layout
                            />
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground ml-2">
                        Step {currentStep + 1} of {TOTAL_STEPS}
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
