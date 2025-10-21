"use client";

import { FormButton, FormSubmit } from "@/src/components/ui/form";

interface MultiFormButtonsProps {
    currentStep: number;
    totalSteps: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    onPrev: () => void;
    onNext: () => void;
    submitButtonText?: string;
    submitButtonColor?: string;
    backButtonText?: string;
    nextButtonText?: string;
}

export function MultiFormButtons({ currentStep, totalSteps, isFirstStep, isLastStep, onPrev, onNext, submitButtonText = "Submit", submitButtonColor, backButtonText = "Back", nextButtonText = "Next" }: MultiFormButtonsProps) {
    return (
        <div className="mt-8 flex items-center justify-between">
            {/* Back Button */}
            <FormButton type="button" variant="secondary" disabled={isFirstStep} onClick={onPrev} className="bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:bg-stone-200/80 dark:hover:bg-stone-700/80 hover:text-stone-800 dark:hover:text-stone-100 transition-colors">
                {backButtonText}
            </FormButton>

            {/* Next/Submit Button */}
            {isLastStep ? (
                <FormSubmit className="px-6 bg-muted text-muted-foreground border-muted hover:bg-muted/80 hover:text-foreground transition-colors">{submitButtonText}</FormSubmit>
            ) : (
                <FormButton type="button" variant="primary" onClick={onNext} className="opacity-70 hover:opacity-100 transition-opacity px-6">
                    {nextButtonText}
                </FormButton>
            )}
        </div>
    );
}
