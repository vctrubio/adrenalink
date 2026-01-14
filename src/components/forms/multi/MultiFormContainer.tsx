"use client";

import { useState, useEffect } from "react";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { Form } from "@/src/components/ui/form";
import type { FormStep } from "./types";
import { WelcomeSchoolResponseBanner } from "../WelcomeSchoolResponseBanner";
import { WelcomeFormFooterWindSteps } from "../WelcomeFormFooterWindSteps";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

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
    className = "w-full max-w-7xl mx-auto",
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

    const { handleSubmit, trigger, formState, setFocus, watch } = formMethods;

    // Auto-focus first input when step changes
    useEffect(() => {
        const currentFields = steps[stepIndex]?.fields;
        if (currentFields && currentFields.length > 0) {
            setTimeout(() => setFocus(currentFields[0] as any), 50);
        }
    }, [stepIndex, setFocus, steps]);

    // Watch fields for reactive validation of the Next button
    const currentFields = steps[stepIndex]?.fields || [];
    watch(currentFields as any);

    // Determine if the current step is valid (visually)
    const isCurrentStepValid = currentFields.every((field) => {
        const value = formMethods.getValues(field);
        const hasError = !!formState.errors[field];
        return !hasError && value !== "" && value !== undefined && value !== null;
    });

    // Navigation functions
    const handleNext = async (e?: React.MouseEvent) => {
        e?.stopPropagation();

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
        } else {
            // Submit
            handleSubmit(handleFormSubmit)();
        }
    };

    const prev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (stepIndex > 0) {
            const newStep = stepIndex - 1;
            setStepIndex(newStep);
            onStepChange?.(newStep);
        }
    };

    const goTo = (idx: number) => {
        setStepIndex(idx);
        onStepChange?.(idx);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !(e.target as HTMLElement).closest("button, [type=submit]")) {
                e.preventDefault();
                handleNext();
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
        <div className={`px-4 md:px-0 pb-32 ${className}`}>
            <Form
                methods={formMethods}
                onSubmit={handleSubmit(handleFormSubmit)}
                className="w-full mt-4"
            >
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-border/50 bg-card">
                    {/* Header (Dark Zinc) - Static Top */}
                    <div className="px-6 py-4 flex items-center justify-between min-h-[84px] bg-zinc-900 text-white">
                        <div className="flex items-center gap-5">
                            {/* Step Indicator or Title */}
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-white/40 uppercase tracking-widest">
                                    Step {stepIndex + 1} of {steps.length}
                                </span>
                                <span className="text-lg font-bold tracking-tight">
                                    {currentSubtitle || title || "Details"}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1" />

                        {/* Navigation Arrows */}
                        <div className="flex items-center gap-4">
                            {/* Prev Arrow */}
                            <button
                                type="button"
                                onClick={prev}
                                disabled={stepIndex === 0}
                                className={`transform -rotate-90 transition-all duration-200 ${
                                    stepIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:scale-110 active:scale-95"
                                }`}
                            >
                                <AdranlinkIcon size={32} className="text-white" />
                            </button>

                            {/* Next Arrow */}
                            <motion.button
                                type="button"
                                onClick={handleNext}
                                animate={isShake ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                className={`transform rotate-90 transition-all duration-200 hover:scale-110 active:scale-95`}
                            >
                                <AdranlinkIcon 
                                    size={32} 
                                    className={isCurrentStepValid ? "text-primary" : "text-white"} 
                                />
                            </motion.button>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="bg-muted/30">
                        <div className="p-6 md:p-12">
                            {CurrentStepComponent && (
                                <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                    <CurrentStepComponent {...currentStepProps} formMethods={formMethods} onGoToStep={goTo} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Form>

            <WelcomeFormFooterWindSteps steps={steps} currentStep={stepIndex} onStepClick={goTo} />
        </div>
    );
}
