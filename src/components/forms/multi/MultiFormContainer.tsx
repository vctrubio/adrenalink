"use client";

import { useState, useEffect } from "react";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { Form } from "@/src/components/ui/form";
import { MultiFormStepper } from "./MultiFormStepper";
import { MultiFormButtons } from "./MultiFormButtons";
import type { FormStep } from "./types";
import { AlertCircle, CheckCircle2, MessageCircle } from "lucide-react";

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
    successButtonText?: string;
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
    successButtonText = "Go to Home",
}: MultiFormContainerProps<T>) {
    const [stepIndex, setStepIndex] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    
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

    const goTo = async (idx: number) => {
        if (idx < 0 || idx >= steps.length) return;

        if (idx < stepIndex) {
            // Allow going back without validation
            setStepIndex(idx);
            onStepChange?.(idx);
        } else {
            // Going forward: validate all steps in between
            for (let i = stepIndex; i < idx; i++) {
                const currentFields = steps[i].fields;
                const isValid = currentFields?.length === 0 ? true : await trigger(currentFields as (keyof T)[]);
                if (!isValid) {
                    if (i !== stepIndex) {
                        setStepIndex(i);
                        onStepChange?.(i);
                    }
                    return;
                }
            }
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
        setIsError(false);
        try {
            await onSubmit(data);
            setIsSubmitted(true);
        } catch (error: any) {
            console.error("Form submission error:", error);
            setIsError(true);
            setErrorMessage(error.message || "Something went wrong");
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
                <div className="bg-card rounded-lg border border-border p-6 md:p-8 text-center animate-in fade-in duration-500">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300 delay-200">
                            <CheckCircle2 className="w-8 h-8 text-secondary" />
                        </div>

                        <div className="animate-in slide-in-from-bottom duration-500 delay-300">
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{successTitle}</h1>
                            <p className="text-muted-foreground text-lg">{successMessage}</p>
                        </div>

                        <div className="animate-in slide-in-from-bottom duration-500 delay-500">
                            <button 
                                onClick={() => {
                                    if (onSuccessButtonClick) {
                                        onSuccessButtonClick();
                                    } else {
                                        window.location.href = "/";
                                    }
                                }} 
                                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-3 rounded-md font-medium transition-all duration-200 shadow-md"
                            >
                                {successButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error view
    if (isError) {
        return (
            <div className={className}>
                <div className="bg-card rounded-lg border border-warning/30 p-6 md:p-8 text-center animate-in fade-in duration-500">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300 delay-200">
                            <AlertCircle className="w-8 h-8 text-warning" />
                        </div>

                        <div className="animate-in slide-in-from-bottom duration-500 delay-300">
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Something Went Wrong</h1>
                            <p className="text-muted-foreground text-lg mb-2">Don't worry, we will get back to you as soon as possible.</p>
                            <p className="text-sm text-muted-foreground/70 italic">Error: {errorMessage}</p>
                        </div>

                        <div className="animate-in slide-in-from-bottom duration-500 delay-500 space-y-4">
                            <div className="p-4 bg-muted/50 rounded-lg inline-block">
                                <p className="text-sm font-medium mb-2">Contact me directly:</p>
                                <a 
                                    href="https://wa.me/+34686516248" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 text-secondary hover:text-secondary/80 font-bold transition-colors"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Victor Rubio - Founder
                                </a>
                            </div>
                            
                            <div>
                                <button 
                                    onClick={() => setIsError(false)} 
                                    className="text-muted-foreground hover:text-foreground text-sm underline transition-colors"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`mt-4 md:mt-18 px-2 md:px-0 ${className}`}>
            {/* Header */}
            {(title || currentSubtitle) && (
                <div className="mb-3 md:mb-8 text-center">
                    {title && <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-foreground mb-1 md:mb-2">{title}</h1>}
                    {currentSubtitle && <p className="text-sm md:text-lg text-muted-foreground">{currentSubtitle}</p>}
                </div>
            )}

            {/* Stepper */}
            <MultiFormStepper steps={steps} currentStep={stepIndex} onStepClick={goTo} />

            {/* Form */}
            <Form methods={formMethods} onSubmit={handleSubmit(handleFormSubmit)} className="bg-card rounded-lg md:rounded-xl border border-border/50 p-3 md:p-8 lg:p-12 shadow-lg mx-auto">
                {/* Current Step Content */}
                {CurrentStepComponent && (
                    <div className="space-y-4 md:space-y-6">
                        <CurrentStepComponent {...currentStepProps} formMethods={formMethods} onGoToStep={goTo} />
                    </div>
                )}

                {/* Navigation */}
                <MultiFormButtons isFirstStep={stepIndex === 0} isLastStep={stepIndex === steps.length - 1} onPrev={prev} onNext={next} submitButtonText={submitButtonText} isFormValid={formState.isValid} />
            </Form>
        </div>
    );
}
