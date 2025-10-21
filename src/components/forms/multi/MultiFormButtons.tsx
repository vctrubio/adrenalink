"use client";

import { FormButton, FormSubmit } from "@/src/components/ui/form";

interface MultiFormButtonsProps {
    isFirstStep: boolean;
    isLastStep: boolean;
    onPrev: () => void;
    onNext: () => void;
    submitButtonText?: string;
    backButtonText?: string;
    nextButtonText?: string;
    isFormValid?: boolean;
}

export function MultiFormButtons({ isFirstStep, isLastStep, onPrev, onNext, submitButtonText = "Submit", backButtonText = "Back", nextButtonText = "Next", isFormValid = false }: MultiFormButtonsProps) {
    return (
        <div className="mt-8 flex items-center justify-between">
            {/* Back Button */}
            <FormButton
                type="button"
                variant="secondary"
                disabled={isFirstStep}
                onClick={onPrev}
                className="px-6 py-2 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:bg-stone-200/80 dark:hover:bg-stone-700/80 hover:text-stone-800 dark:hover:text-stone-100 transition-colors"
            >
                {backButtonText}
            </FormButton>

            {/* Next/Submit Button */}
            {isLastStep ? (
                <FormSubmit className={`px-6 py-2 w-auto transition-opacity ${isFormValid ? "bg-secondary text-secondary-foreground hover:bg-secondary/90 opacity-100" : "opacity-70 hover:opacity-100"}`}>{submitButtonText}</FormSubmit>
            ) : (
                <FormButton type="button" variant="secondary" onClick={onNext} className="px-6 py-2 opacity-70 hover:opacity-100 transition-opacity">
                    {nextButtonText}
                </FormButton>
            )}
        </div>
    );
}
