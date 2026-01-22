"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { StatsExplainer, AdminDashboardPreview, BadgeShowcase, NavigationGuide } from "./steps";
import { Play, ArrowLeft, ArrowRight, FileText } from "lucide-react";

const TOTAL_STEPS = 6;
const TOTAL_STEPS_SKIP_STATS = 5;

export default function Onboarding() {
    const searchParams = useSearchParams();
    const skipStats = searchParams?.get("skipStats") === "true";
    const [currentStep, setCurrentStep] = useState(0);
    const wavesCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const wavesCanvas = wavesCanvasRef.current;
        if (!wavesCanvas) return;

        const ctx = wavesCanvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        const resizeCanvas = () => {
            wavesCanvas.width = window.innerWidth;
            wavesCanvas.height = window.innerHeight;
        };

        const draw = () => {
            time += 0.005;
            ctx.clearRect(0, 0, wavesCanvas.width, wavesCanvas.height);

            const centerY = wavesCanvas.height / 2;

            for (let layer = 0; layer < 3; layer++) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 - layer * 0.03})`;
                ctx.lineWidth = 1.5;

                for (let x = 0; x < wavesCanvas.width; x += 3) {
                    const wave1 = Math.sin(x * 0.01 + time + layer) * 30;
                    const wave2 = Math.sin(x * 0.005 + time * 0.5 + layer * 2) * 20;
                    const y = centerY + wave1 + wave2;

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            animationId = requestAnimationFrame(draw);
        };

        resizeCanvas();
        draw();

        window.addEventListener("resize", resizeCanvas);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    const handlePageClick = () => {
        const maxStep = 5;
        if (currentStep < maxStep) {
            let nextStep = currentStep + 1;
            if (skipStats && currentStep === 0) {
                nextStep = 2;
            }
            setCurrentStep(nextStep);
            console.log("Current Step:", nextStep);
        }
    };

    const handleFounderClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handlePageClick();
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't handle if user is typing in an input field
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // Get the valid step mapping based on skipStats
            const stepMapping = skipStats ? [0, 2, 3, 4, 5] : Array.from({ length: TOTAL_STEPS }, (_, idx) => idx);
            const currentIndex = stepMapping.indexOf(currentStep);

            if (e.key === "ArrowRight") {
                e.preventDefault();
                if (currentIndex < stepMapping.length - 1) {
                    setCurrentStep(stepMapping[currentIndex + 1]);
                }
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                if (currentIndex > 0) {
                    setCurrentStep(stepMapping[currentIndex - 1]);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [currentStep, skipStats]);

    return (
        <div className={`min-h-screen flex flex-col cursor-pointer relative overflow-hidden ${currentStep === 0 ? "bg-white" : "bg-background"}`} onClick={handlePageClick}>
            {currentStep === 0 && <canvas ref={wavesCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />}

            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 relative z-10">
                {currentStep === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="flex flex-row items-center gap-6">
                            <div className="relative w-20 h-20 flex-shrink-0">
                                <Image src="/ADR.webp" alt="Adrenalink Logo" fill className="object-contain" priority />
                            </div>
                            <h1 className="text-6xl md:text-7xl font-bold tracking-tight drop-shadow-lg text-slate-900">Adrenalink</h1>
                        </div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <p className="text-lg font-semibold text-slate-600 tracking-wide uppercase">Administration Guide</p>
                            <div className="flex flex-col items-start gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <p className="text-sm font-medium text-slate-600">Learn the <strong>system design</strong></p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <p className="text-sm font-medium text-slate-600">Get <strong>comfortable</strong> with icons/entities</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <p className="text-sm font-medium text-slate-600 tracking-wide"><strong>Register</strong> students, teachers and more</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {!skipStats && currentStep === 1 && <FounderIntro onClick={handleFounderClick} />}
                    {currentStep === 2 && <StatsExplainer />}
                    {currentStep === 3 && <BadgeShowcase />}
                    {currentStep === 4 && <AdminDashboardPreview />}
                    {currentStep === 5 && <NavigationGuide />}
                </AnimatePresence>
            </div>

            <div className="p-6 md:p-8 flex flex-col items-center gap-4 relative z-10">
                {currentStep === 0 && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="flex flex-col sm:flex-row items-center gap-4 mb-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Link
                                href="/onboarding/video"
                                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 group"
                            >
                                <Play className="w-5 h-5 transition-transform group-hover:scale-110" />
                                <span className="tracking-wide">Watch The Video</span>
                            </Link>
                            <Link
                                href="/onboarding/pdf"
                                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-700 hover:bg-slate-800 text-white font-semibold text-lg rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 group"
                            >
                                <FileText className="w-5 h-5 transition-transform group-hover:scale-110" />
                                <span className="tracking-wide">Download PDF</span>
                            </Link>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="flex items-center gap-3 text-slate-600"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-xs font-medium tracking-wide">Navigate with arrow keys</span>
                            <ArrowRight className="w-4 h-4" />
                        </motion.div>
                    </>
                )}
                {currentStep === 5 && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm italic text-muted-foreground"
                    >
                        Thank you for listening.
                    </motion.p>
                )}
                
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-2">
                        {Array.from({ length: skipStats ? TOTAL_STEPS_SKIP_STATS : TOTAL_STEPS }).map((_, i) => {
                            const stepMapping = skipStats ? [0, 2, 3, 4, 5] : Array.from({ length: TOTAL_STEPS }, (_, idx) => idx);
                            const targetStep = stepMapping[i];
                            const isActive = targetStep <= currentStep;
                            const dotColor = currentStep === 0 ? (isActive ? "bg-blue-500" : "bg-slate-300") : (isActive ? "bg-primary" : "bg-muted");

                            return (
                                <motion.button
                                    key={i}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentStep(targetStep);
                                    }}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`h-2.5 w-8 rounded-full transition-colors cursor-pointer ${dotColor}`}
                                    type="button"
                                    aria-label={`Go to step ${i + 1}`}
                                />
                            );
                        })}
                    </div>
                    <p className={`text-xs font-medium tracking-wide uppercase ${currentStep === 0 ? "text-slate-600" : "text-muted-foreground"}`}>
                        {(() => {
                            const displayStep = currentStep + 1;
                            const total = skipStats ? TOTAL_STEPS_SKIP_STATS : TOTAL_STEPS;
                            return `Step ${displayStep} of ${total}`;
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
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-2 border-slate-200 shadow-2xl">
                <Image src="/www.webp" alt="Founder" fill className="object-cover" priority />
            </div>
        </motion.div>
    );
}
