"use client";

import { useState, useEffect } from "react";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { Form } from "@/src/components/ui/form";
import type { FormStep } from "./types";
import { WelcomeSchoolResponseBanner } from "../WelcomeSchoolResponseBanner";
import { WelcomeFormFooterWindSteps } from "../WelcomeFormFooterWindSteps";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";

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
    const [isOpen, setIsOpen] = useState(true);

    const { handleSubmit, trigger, formState, setFocus, watch } = formMethods;

    // Auto-focus first input when step changes
    useEffect(() => {
        const currentFields = steps[stepIndex]?.fields;
        if (currentFields && currentFields.length > 0 && isOpen) {
            setTimeout(() => setFocus(currentFields[0] as any), 50);
        }
    }, [stepIndex, setFocus, steps, isOpen]);

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
        e?.stopPropagation(); // Prevent toggling open/close

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

    const handleFooterClick = () => {
        setIsOpen(!isOpen);
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
            {/* TOP FLOATING HEADER - Dark Bar */}
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none"
            >
                 <div 
                    onClick={handleFooterClick}
                    className="w-full max-w-7xl px-6 py-4 flex items-center justify-between min-h-[72px] bg-zinc-900 text-white cursor-pointer hover:bg-zinc-800 transition-colors shadow-2xl rounded-full pointer-events-auto border border-white/10"
                 >
                    <div className="flex items-center gap-5">
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

                    <div className="flex items-center gap-4">
                        <motion.div
                            animate={isShake ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                            transition={{ duration: 0.4 }}
                        >
                            <ToggleAdranalinkIcon 
                                isOpen={isOpen} 
                                onClick={handleNext} 
                                color={isCurrentStepValid ? "#22c55e" : "white"}
                                variant="lg"
                                className="hover:scale-110 transition-transform"
                            />
                        </motion.div>
                    </div>
                 </div>
            </motion.div>

            <Form
                methods={formMethods}
                onSubmit={handleSubmit(handleFormSubmit)}
                className="w-full mt-24"
            >
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-border/50 bg-card">
                    {/* Collapsible Content Body */}
                    <AnimatePresence initial={false}>
                        {isOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="bg-muted/30"
                            >
                                <div className="p-6 md:p-12">
                                    {CurrentStepComponent && (
                                        <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                            <CurrentStepComponent {...currentStepProps} formMethods={formMethods} onGoToStep={(idx: number) => setStepIndex(idx)} />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Form>

            <WelcomeFormFooterWindSteps steps={steps} currentStep={stepIndex} onStepClick={goTo} />
        </div>
    );
}
