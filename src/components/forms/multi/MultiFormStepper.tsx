"use client";

import { CheckCircle2 } from "lucide-react";
import type { FormStep } from "./types";

interface MultiFormStepperProps {
    steps: FormStep[];
    currentStep: number;
    onStepClick: (stepIndex: number) => void;
}

export function MultiFormStepper({ steps, currentStep, onStepClick }: MultiFormStepperProps) {
    return (
        <div className="bg-card/50 border border-border/30 rounded-lg md:rounded-xl p-2 md:p-4 lg:p-8 mb-4 md:mb-8 backdrop-blur-sm mx-auto">
            <div className="w-full overflow-x-auto scrollbar-hide">
                <div className="flex items-center justify-center min-w-fit px-0 md:px-2 gap-0">
                    {steps.map((step, idx) => {
                        const complete = idx < currentStep;
                        const active = idx === currentStep;
                        const isLast = idx === steps.length - 1;

                        return (
                            <div key={step.id} className="flex items-center flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onStepClick(idx)}
                                    className="flex flex-col items-center gap-1 md:gap-3 px-0.5 md:px-3 py-2 md:py-3 hover:bg-accent/20 rounded-lg transition-all duration-200"
                                    aria-current={active}
                                >
                                    <div
                                        className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-all duration-300 shadow-sm
                                        ${
                                            complete
                                                ? "bg-primary text-primary-foreground shadow-primary/20"
                                                : active
                                                  ? "bg-secondary text-secondary-foreground shadow-secondary/20 ring-2 ring-secondary/30"
                                                  : "bg-muted text-muted-foreground border-2 border-border hover:border-border/60"
                                        }
                                    `}
                                    >
                                        {complete ? <CheckCircle2 className="w-4 h-4 md:w-6 md:h-6" /> : step.icon || step.id}
                                    </div>
                                    <span
                                        className={`text-xs md:text-sm transition-all duration-200 whitespace-nowrap ${
                                            active
                                                ? "font-semibold text-foreground"
                                                : complete
                                                  ? "font-medium text-foreground/80"
                                                  : "text-muted-foreground"
                                        }`}
                                    >
                                        {step.title}
                                    </span>
                                </button>

                                {!isLast && (
                                    <div
                                        className={`h-0.5 md:h-1 w-2 md:w-8 mx-0.5 md:mx-2 rounded-full transition-all duration-300 ${
                                            complete ? "bg-primary/60" : "bg-border"
                                        }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
