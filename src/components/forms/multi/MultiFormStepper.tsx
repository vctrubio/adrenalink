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
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center">
                {steps.map((step, idx) => {
                    const complete = idx < currentStep;
                    const active = idx === currentStep;
                    const isLast = idx === steps.length - 1;
                    
                    return (
                        <div key={step.id} className="flex items-center">
                            <button 
                                type="button" 
                                onClick={() => onStepClick(idx)} 
                                className="flex flex-col items-center gap-2 px-4 py-2" 
                                aria-current={active}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                                    ${complete ? "bg-secondary text-white" : active ? "bg-secondary text-white" : "bg-muted text-muted-foreground border-2 border-muted"}
                                `}
                                >
                                    {complete ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                                </div>
                                <span className={`text-sm ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                                    {step.title}
                                </span>
                            </button>
                            
                            {!isLast && (
                                <div className={`h-0.5 w-16 mx-2 transition-all ${complete ? "bg-secondary" : "bg-muted"}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

