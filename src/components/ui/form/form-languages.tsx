"use client";

import { forwardRef, useState, useCallback } from "react";
import { LANGUAGES } from "@/supabase/db/enums";
import { FORM_SUMMARY_COLORS } from "@/types/form-summary";
import FormInput from "./form-input";

const LANGUAGE_OPTIONS = Object.values(LANGUAGES);

interface FormLanguagesProps {
    value: string[];
    onChange: (languages: string[]) => void;
    disabled?: boolean;
}

const FormLanguages = forwardRef<HTMLDivElement, FormLanguagesProps>(({ value = [], onChange, disabled = false }, ref) => {
    const [customLanguage, setCustomLanguage] = useState("");
    const [showOtherInput, setShowOtherInput] = useState(false);

    const standardLanguages = value.filter((lang) => LANGUAGE_OPTIONS.includes(lang as (typeof LANGUAGE_OPTIONS)[number]));
    const customLanguages = value.filter((lang) => !LANGUAGE_OPTIONS.includes(lang as (typeof LANGUAGE_OPTIONS)[number]));

    const handleToggle = useCallback(
        (language: string) => {
            if (value.includes(language)) {
                onChange(value.filter((l) => l !== language));
            } else {
                onChange([...value, language]);
            }
        },
        [value, onChange],
    );

    const handleAddCustomLanguage = useCallback(() => {
        if (customLanguage.trim() && !value.includes(customLanguage.trim())) {
            onChange([...value, customLanguage.trim()]);
            setCustomLanguage("");
            setShowOtherInput(false);
        }
    }, [customLanguage, value, onChange]);

    const handleRemoveLanguage = useCallback(
        (language: string) => {
            onChange(value.filter((l) => l !== language));
        },
        [value, onChange],
    );

    return (
        <div ref={ref} className="space-y-3">
            {/* Standard language buttons */}
            <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((language) => (
                    <button
                        key={language}
                        type="button"
                        onClick={() => handleToggle(language)}
                        disabled={disabled}
                        className={`px-4 py-2 text-sm font-medium rounded-md border-2 transition-all ${
                            standardLanguages.includes(language)
                                ? `${FORM_SUMMARY_COLORS.required.bg} border-green-300 dark:border-green-700 text-foreground`
                                : "bg-background text-foreground border-input hover:border-green-300/50"
                        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        {language}
                    </button>
                ))}

                {/* Other button */}
                <button
                    type="button"
                    onClick={() => setShowOtherInput(!showOtherInput)}
                    disabled={disabled}
                    className={`px-4 py-2 text-sm font-medium rounded-md border-2 transition-all ${
                        showOtherInput
                            ? `${FORM_SUMMARY_COLORS.required.bg} border-green-300 dark:border-green-700 text-foreground`
                            : "bg-background text-foreground border-input hover:border-green-300/50"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                    Other +
                </button>
            </div>

            {/* Other language input */}
            {showOtherInput && (
                <div className="flex gap-2">
                    <FormInput
                        type="text"
                        value={customLanguage}
                        onChange={(e) => setCustomLanguage(e.target.value)}
                        placeholder="Enter language name"
                        disabled={disabled}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCustomLanguage();
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={handleAddCustomLanguage}
                        disabled={disabled}
                        className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        Add
                    </button>
                </div>
            )}

            {/* Custom languages display */}
            {customLanguages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {customLanguages.map((language) => (
                        <div
                            key={language}
                            className={`px-4 py-2 text-sm font-medium rounded-md border-2 border-green-300 dark:border-green-700 ${FORM_SUMMARY_COLORS.required.bg} text-foreground flex items-center gap-2`}
                        >
                            {language}
                            <button
                                type="button"
                                onClick={() => handleRemoveLanguage(language)}
                                disabled={disabled}
                                className="text-xs hover:text-destructive"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

FormLanguages.displayName = "FormLanguages";

export default FormLanguages;
