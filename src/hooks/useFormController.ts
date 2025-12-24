"use client";

import { useState, useCallback } from "react";

export interface FormControllerState {
    isLoading: boolean;
    isFormReady: boolean;
}

export interface FormControllerActions {
    setIsLoading: (loading: boolean) => void;
    handleSubmit: () => Promise<void>;
    handleReset: () => void;
}

export interface UseFormControllerProps {
    onSubmit: () => Promise<void>;
    onReset?: () => void;
    isFormValid: boolean;
}

export function useFormController({
    onSubmit,
    onReset,
    isFormValid,
}: UseFormControllerProps): FormControllerState & FormControllerActions {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (!isFormValid || isLoading) return;

        setIsLoading(true);
        try {
            await onSubmit();
        } finally {
            setIsLoading(false);
        }
    }, [isFormValid, isLoading, onSubmit]);

    const handleReset = useCallback(() => {
        setIsLoading(false);
        onReset?.();
    }, [onReset]);

    return {
        // State
        isLoading,
        isFormReady: isFormValid,
        // Actions
        setIsLoading,
        handleSubmit,
        handleReset,
    };
}
