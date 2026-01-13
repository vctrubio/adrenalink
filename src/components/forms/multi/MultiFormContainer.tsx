"use client";

import { useState, useEffect } from "react";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { Form } from "@/src/components/ui/form";
import type { FormStep } from "./types";
import { WelcomeSchoolResponseBanner } from "../WelcomeSchoolResponseBanner";
import { WelcomeFormFooterWindSteps } from "../WelcomeFormFooterWindSteps";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

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
    onSuccessButtonClick?: () => void;

    // State change callback
    onStateChange?: (state: { isSubmitted: boolean; isError: boolean }) => void;
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
    className = "w-full max-w-5xl mx-auto",
    onStepChange,
    submitButtonText = "Submit",
    successTitle = "Congratulations",
    successMessage = "We will get back to you in 1 business day. Thank you.",
    successButtonText = "Go to Home",
    onSuccessButtonClick,
    onStateChange,
}: MultiFormContainerProps<T>) {
    const [stepIndex, setStepIndex] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isShake, setIsShake] = useState(false);

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

        if (!isValid) {
            setIsShake(true);
            setTimeout(() => setIsShake(false), 500);
            return;
        }

        if (stepIndex < steps.length - 1) {
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
            onStateChange?.({ isSubmitted: true, isError: false });
        } catch (error: any) {
            console.error("Form submission error:", error);
            setIsError(true);
            setErrorMessage(error.message || "Something went wrong");
            onStateChange?.({ isSubmitted: false, isError: true });
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
                <WelcomeSchoolResponseBanner
                    status="success"
                    title={successTitle || "Congratulations"}
                    message={successMessage || "Operation successful."}
                    primaryButtonText={successButtonText || "Continue"}
                    onPrimaryAction={() => {
                        if (onSuccessButtonClick) {
                            onSuccessButtonClick();
                        } else {
                            window.location.href = "/";
                        }
                    }}
                />
            </div>
        );
    }

    // Error view
    if (isError) {
        return (
            <div className={className}>
                <WelcomeSchoolResponseBanner
                    status="error"
                    title="Something Went Wrong"
                    message="Don't worry, we will get back to you as soon as possible."
                    primaryButtonText="Try again"
                    onPrimaryAction={() => {
                        setIsError(false);
                        onStateChange?.({ isSubmitted: false, isError: false });
                    }}
                    errorDetails={errorMessage}
                />
            </div>
        );
    }

    return (
        <div className={`mt-12 md:mt-32 px-4 md:px-0 ${className}`}>
            <Form
                methods={formMethods}
                onSubmit={handleSubmit(handleFormSubmit)}
                className="w-full"
            >
                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-8 md:mb-12 px-2">
                    {/* Back Button */}
                    <div className="w-12 md:w-16 flex justify-start">
                        <button
                            type="button"
                            onClick={prev}
                            disabled={stepIndex === 0}
                            className={`
                                p-3 md:p-4 rounded-full transition-all duration-300
                                ${stepIndex === 0 
                                    ? "opacity-0 pointer-events-none" 
                                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95"}
                            `}
                            aria-label="Previous Step"
                        >
                            <ArrowLeft className="w-6 h-6 md:w-7 md:h-7" />
                        </button>
                    </div>

                    {/* Title */}
                    <div className="flex-1 text-center space-y-2">
                        {(title || currentSubtitle) && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {title && <h1 className="text-xl md:text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tighter mb-2">{title}</h1>}
                                {currentSubtitle && (
                                    <p className="text-lg md:text-2xl font-bold text-muted-foreground tracking-tight leading-tight max-w-xl mx-auto">
                                        {currentSubtitle}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Next/Submit Button */}
                    <div className="w-12 md:w-16 flex justify-end">
                        {stepIndex < steps.length - 1 ? (
                            <motion.button
                                type="button"
                                onClick={next}
                                animate={isShake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                className={`
                                    p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300
                                    ${isShake 
                                        ? "bg-red-500 text-white" 
                                        : steps[stepIndex].fields.some(field => !!formState.errors[field as keyof T])
                                            ? "bg-muted text-muted-foreground opacity-50 grayscale cursor-not-allowed"
                                            : "bg-foreground text-background hover:bg-foreground/90"}
                                `}
                                aria-label="Next Step"
                            >
                                <ArrowRight className="w-6 h-6 md:w-7 md:h-7" />
                            </motion.button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!formState.isValid}
                                className={`
                                    p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300
                                    ${formState.isValid 
                                        ? "bg-green-500 text-white hover:bg-green-600" 
                                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"}
                                `}
                                aria-label="Submit Form"
                            >
                                <Check className="w-6 h-6 md:w-7 md:h-7" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-card rounded-2xl md:rounded-[2.5rem] border border-border/50 p-6 md:p-12 lg:p-20 shadow-2xl mx-auto min-h-[400px] flex flex-col justify-center">
                    {CurrentStepComponent && (
                        <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            <CurrentStepComponent {...currentStepProps} formMethods={formMethods} onGoToStep={goTo} />
                        </div>
                    )}
                </div>
            </Form>

            <WelcomeFormFooterWindSteps steps={steps} currentStep={stepIndex} onStepClick={goTo} />
        </div>
    );
}
