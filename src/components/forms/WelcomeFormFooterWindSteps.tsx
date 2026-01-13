"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { WindToggle } from "@/src/components/themes/WindToggle";
import type { FormStep } from "./multi/types";

interface WelcomeFormFooterWindStepsProps {
    steps: FormStep[];
    currentStep: number;
    onStepClick: (stepIndex: number) => void;
}

export function WelcomeFormFooterWindSteps({ steps, currentStep, onStepClick }: WelcomeFormFooterWindStepsProps) {
    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{
                y: 0,
                opacity: 1,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
        >
            <div className="w-full backdrop-blur-xl bg-background/80 border-t border-border/40 pointer-events-auto shadow-2xl">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto py-3 flex items-center justify-between gap-4 md:gap-8">
                        
                        {/* Stepper (Centered/Left) */}
                        <div className="flex-1 flex justify-center md:justify-start overflow-x-auto scrollbar-hide py-1">
                            <div className="flex items-center gap-1 md:gap-2">
                                {steps.map((step, idx) => {
                                    const complete = idx < currentStep;
                                    const active = idx === currentStep;
                                    const isLast = idx === steps.length - 1;

                                    return (
                                        <div key={step.id} className="flex items-center flex-shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => onStepClick(idx)}
                                                className={`
                                                    flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300
                                                    ${active ? "bg-secondary/10 ring-1 ring-secondary/20" : "hover:bg-accent/50"}
                                                `}
                                                aria-current={active}
                                            >
                                                <div
                                                    className={`
                                                        w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-medium transition-all duration-300
                                                        ${
                                                            complete
                                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                                : active
                                                                ? "bg-secondary text-secondary-foreground shadow-md scale-110"
                                                                : "bg-muted text-muted-foreground border border-border"
                                                        }
                                                    `}
                                                >
                                                    {complete ? <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" /> : step.icon || step.id}
                                                </div>
                                                <span
                                                    className={`hidden md:block text-xs font-bold transition-colors ${
                                                        active
                                                            ? "text-zinc-900 dark:text-zinc-100"
                                                            : complete
                                                            ? "text-zinc-700 dark:text-zinc-300"
                                                            : "text-zinc-400 dark:text-zinc-500"
                                                    }`}
                                                >
                                                    {step.title}
                                                </span>
                                            </button>

                                            {!isLast && (
                                                <div className={`h-px w-2 md:w-6 mx-1 ${complete ? "bg-primary/50" : "bg-border"}`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Wind Toggle (Right) */}
                        <div className="flex items-center gap-3 shrink-0 pl-4 border-l border-border/20">
                            <span className="hidden md:inline text-muted-foreground text-xs font-medium uppercase tracking-wider">Change the Wind</span>
                            <WindToggle />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
