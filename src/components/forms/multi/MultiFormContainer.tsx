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
    showFloatingNav = true,
    navSlogan = "streamlining the experience"
}: MultiFormContainerProps<T>) {
    const [stepIndex, setStepIndex] = useState(0);
    const { handleSubmit, trigger } = formMethods;

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

    // Get current step component and subtitle
    const CurrentStepComponent = stepComponents[stepIndex];
    const currentStepProps = stepProps[stepIndex] || {};
    const currentSubtitle = stepSubtitles?.[stepIndex] || subtitle;

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
            <Form methods={formMethods} onSubmit={handleSubmit(onSubmit)} className="bg-card rounded-lg border border-border p-6 md:p-8">
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
                />
            </Form>
        </div>
    );
}