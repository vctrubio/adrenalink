"use client";

import { useState, useEffect } from "react";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { Form } from "@/src/components/ui/form";
import FloatingNav from "@/src/components/navigations/FloatingNav";
import { MultiFormStepper } from "./MultiFormStepper";
import { MultiFormButtons } from "./MultiFormButtons";
import type { FormStep } from "./types";

interface MultiFormContainerProps<T extends FieldValues = FieldValues> {
    // Form configuration
    steps: FormStep<T>[];
    formMethods: UseFormReturn<T>;
    onSubmit: (data: T) => Promise<void>;
    
    // Step components
    stepComponents: Record<number, React.ComponentType<any>>;
    stepProps: Record<number, any>;
    
    // UI customization
    title?: string;
    subtitle?: string;
    stepSubtitles?: Record<number, string>;
    className?: string;
    
    // Navigation
    onStepChange?: (stepIndex: number) => void;
    
    // Submit button
    submitButtonText?: string;
    
    // Success state
    successTitle?: string;
    successMessage?: string;
    
    // Floating nav
    showFloatingNav?: boolean;
    navSlogan?: string;
}

export function MultiFormContainer<T extends FieldValues = FieldValues>({
    steps,
    formMethods,
    onSubmit,
    stepComponents,
    stepProps,
    title,
    subtitle,
    stepSubtitles,
    className = "w-full max-w-3xl mx-auto",
    onStepChange,
    submitButtonText = "Submit",
    successTitle = "Congratulations",
    successMessage = "We will get back to you in 1 business day. Thank you.",
    showFloatingNav = true,
    navSlogan = "streamlining the experience"
}: MultiFormContainerProps<T>) {
    const [stepIndex, setStepIndex] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { handleSubmit, trigger, formState, setFocus } = formMethods;

    // Auto-focus first input when step changes
    useEffect(() => {
        const currentFields = steps[stepIndex]?.fields;
        if (currentFields && currentFields.length > 0) {
            setTimeout(() => setFocus(currentFields[0] as any), 50);
        }
    }, [stepIndex, setFocus, steps]);

    // Navigation functions
    const next = async () => {
        const currentFields = steps[stepIndex].fields;
        const isValid = currentFields?.length === 0 ? true : await trigger(currentFields as (keyof T)[]);
        if (isValid && stepIndex < steps.length - 1) {
            const newStep = stepIndex + 1;
            setStepIndex(newStep);
            onStepChange?.(newStep);
        }
    };

    const prev = () => {
        if (stepIndex > 0) {
            const newStep = stepIndex - 1;
            setStepIndex(newStep);
            onStepChange?.(newStep);
        }
    };

    const goTo = (idx: number) => {
        if (idx >= 0 && idx < steps.length) {
            setStepIndex(idx);
            onStepChange?.(idx);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !(e.target as HTMLElement).closest("button, [type=submit]")) {
                e.preventDefault();
                if (e.shiftKey) {
                    prev();
                } else {
                    next();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [stepIndex]);

    // Enhanced submit handler
    const handleFormSubmit = async (data: T) => {
        try {
            await onSubmit(data);
            setIsSubmitted(true);
        } catch (error) {
            console.error("Form submission error:", error);
        }
    };

    // Get current step component and subtitle
    const CurrentStepComponent = stepComponents[stepIndex];
    const currentStepProps = stepProps[stepIndex] || {};
    const currentSubtitle = stepSubtitles?.[stepIndex] || subtitle;

    // Success view
    if (isSubmitted) {
        return (
            <div className={className}>
                {/* Floating Nav */}
                {showFloatingNav && <FloatingNav show={showFloatingNav} slogan={navSlogan} />}
                
                {/* Success Content */}
                <div className="bg-card rounded-lg border border-border p-6 md:p-8 text-center animate-in fade-in duration-500">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300 delay-200">
                            <svg className="w-8 h-8 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        
                        <div className="animate-in slide-in-from-bottom duration-500 delay-300">
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{successTitle}</h1>
                            <p className="text-muted-foreground text-lg">{successMessage}</p>
                        </div>
                        
                        <div className="animate-in slide-in-from-bottom duration-500 delay-500">
                            <button
                                onClick={() => window.location.href = "/"}
                                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-3 rounded-md font-medium transition-all duration-200"
                            >
                                Go to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Floating Nav */}
            {showFloatingNav && <FloatingNav show={showFloatingNav} slogan={navSlogan} />}
            
            {/* Header */}
            {(title || currentSubtitle) && (
                <div className="mb-6 text-center">
                    {title && <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>}
                    {currentSubtitle && <p className="text-muted-foreground mt-1">{currentSubtitle}</p>}
                </div>
            )}

            {/* Stepper */}
            <MultiFormStepper steps={steps} currentStep={stepIndex} onStepClick={goTo} />

            {/* Form */}
            <Form methods={formMethods} onSubmit={handleSubmit(handleFormSubmit)} className="bg-card rounded-lg border border-border p-6 md:p-8">
                {/* Current Step Content */}
                {CurrentStepComponent && (
                    <CurrentStepComponent
                        {...currentStepProps}
                        formMethods={formMethods}
                        onGoToStep={goTo}
                    />
                )}

                {/* Navigation */}
                <MultiFormButtons
                    isFirstStep={stepIndex === 0}
                    isLastStep={stepIndex === steps.length - 1}
                    onPrev={prev}
                    onNext={next}
                    submitButtonText={submitButtonText}
                    isFormValid={formState.isValid}
                />
            </Form>
        </div>
    );
}