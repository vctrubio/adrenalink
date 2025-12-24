"use client";

import { useCallback, useMemo, memo, useState } from "react";
import { z } from "zod";
import { ENTITY_DATA } from "@/config/entities";
import { CountryFlagPhoneSubForm } from "../CountryFlagPhoneSubForm";
import { FormField, FormInput } from "@/src/components/ui/form";
import { languagesEnum } from "@/drizzle/schema";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import { FORM_SUMMARY_COLORS } from "@/types/form-summary";
import { MasterSchoolForm } from "./MasterSchoolForm";
import { studentFormSchema, defaultStudentForm, type StudentFormData } from "@/types/form-entities";

// Export the language options from the enum
export const LANGUAGE_OPTIONS = languagesEnum.enumValues;

// Re-export for backward compatibility
export { studentFormSchema, type StudentFormData };

interface StudentFormProps {
    formData: StudentFormData;
    onFormDataChange: (data: StudentFormData) => void;
    isFormReady?: boolean;
    showSubmit?: boolean;
    onSubmit?: () => void;
    isLoading?: boolean;
    onClose?: () => void;
}

// Sub-component: Name Fields
const NameFields = memo(function NameFields({
    firstName,
    lastName,
    onFirstNameChange,
    onLastNameChange,
    firstNameError,
    lastNameError,
    firstNameIsValid,
    lastNameIsValid,
    autoFocus,
}: {
    firstName: string;
    lastName: string;
    onFirstNameChange: (value: string) => void;
    onLastNameChange: (value: string) => void;
    firstNameError?: string;
    lastNameError?: string;
    firstNameIsValid?: boolean;
    lastNameIsValid?: boolean;
    autoFocus?: boolean;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="First Name" required error={firstNameError} isValid={firstNameIsValid}>
                <FormInput type="text" value={firstName} onChange={(e) => onFirstNameChange(e.target.value)} placeholder="Enter first name" error={!!firstNameError} autoFocus={autoFocus} />
            </FormField>
            <FormField label="Last Name" required error={lastNameError} isValid={lastNameIsValid}>
                <FormInput type="text" value={lastName} onChange={(e) => onLastNameChange(e.target.value)} placeholder="Enter last name" error={!!lastNameError} />
            </FormField>
        </div>
    );
});

// Sub-component: Passport Field
const PassportField = memo(function PassportField({ passport, onPassportChange, passportError, passportIsValid }: { passport: string; onPassportChange: (value: string) => void; passportError?: string; passportIsValid?: boolean }) {
    return (
        <FormField label="Passport" required error={passportError} isValid={passportIsValid}>
            <FormInput type="text" value={passport} onChange={(e) => onPassportChange(e.target.value)} placeholder="Enter passport number" error={!!passportError} />
        </FormField>
    );
});

// Sub-component: Languages Selection
const LanguagesField = memo(function LanguagesField({ languages, onLanguageToggle, onCustomLanguageAdd, languagesError }: { languages: string[]; onLanguageToggle: (language: string) => void; onCustomLanguageAdd: (language: string) => void; languagesError?: string }) {
    const [customLanguage, setCustomLanguage] = useState("");
    const [showOtherInput, setShowOtherInput] = useState(false);

    const handleAddCustomLanguage = useCallback(() => {
        if (customLanguage.trim()) {
            onCustomLanguageAdd(customLanguage.trim());
            setCustomLanguage("");
            setShowOtherInput(false);
        }
    }, [customLanguage, onCustomLanguageAdd]);

    const handleRemoveLanguage = useCallback((language: string) => {
        onLanguageToggle(language);
    }, [onLanguageToggle]);

    const { standardLanguages, customLanguages } = useMemo(() => ({
        standardLanguages: languages.filter((lang) => LANGUAGE_OPTIONS.includes(lang as (typeof LANGUAGE_OPTIONS)[number])),
        customLanguages: languages.filter((lang) => !LANGUAGE_OPTIONS.includes(lang as (typeof LANGUAGE_OPTIONS)[number])),
    }), [languages]);

    return (
        <FormField label="Languages" required error={languagesError} isValid={languages.length > 0}>
            <div className="space-y-3">
                {/* Standard language buttons */}
                <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map((language) => (
                        <button
                            key={language}
                            type="button"
                            onClick={() => onLanguageToggle(language)}
                            className={`px-4 py-2 text-sm font-medium rounded-md border-2 transition-all ${standardLanguages.includes(language)
                                ? `${FORM_SUMMARY_COLORS.required.bg} border-green-300 dark:border-green-700 text-foreground`
                                : "bg-background text-foreground border-input hover:border-green-300/50"
                                }`}
                        >
                            {language}
                        </button>
                    ))}

                    {/* Other button */}
                    <button
                        type="button"
                        onClick={() => setShowOtherInput(!showOtherInput)}
                        className={`px-4 py-2 text-sm font-medium rounded-md border-2 transition-all ${showOtherInput
                            ? `${FORM_SUMMARY_COLORS.required.bg} border-green-300 dark:border-green-700 text-foreground`
                            : "bg-background text-foreground border-input hover:border-green-300/50"}`}
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
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddCustomLanguage();
                                }
                            }}
                        />
                        <button type="button" onClick={handleAddCustomLanguage} className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                            Add
                        </button>
                    </div>
                )}

                {/* Custom languages display */}
                {customLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {customLanguages.map((language) => (
                            <div key={language} className={`px-4 py-2 text-sm font-medium rounded-md border-2 border-green-300 dark:border-green-700 ${FORM_SUMMARY_COLORS.required.bg} text-foreground flex items-center gap-2`}>
                                {language}
                                <button type="button" onClick={() => handleRemoveLanguage(language)} className="text-xs hover:text-destructive">
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </FormField>
    );
});

// Sub-component: Description Field
const DescriptionField = memo(function DescriptionField({ description, onDescriptionChange }: { description: string; onDescriptionChange: (value: string) => void }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Description</label>
            <textarea
                value={description || ""}
                onChange={(e) => onDescriptionChange(e.target.value)}
                rows={4}
                placeholder="Add any additional notes..."
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
        </div>
    );
});

// Sub-component: Can Rent Toggle
const CanRentField = memo(function CanRentField({ canRent, onCanRentChange }: { canRent: boolean; onCanRentChange: (value: boolean) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Independent (Can Rent)</label>
            <ToggleSwitch
                value={canRent ? "yes" : "no"}
                onChange={(value) => onCanRentChange(value === "yes")}
                values={{ left: "no", right: "yes" }}
                counts={{ no: 1, yes: 1 }}
                showLabels={true}
            />
        </div>
    );
});

// Main component - ONLY RENDERS
export default function StudentForm({ formData, onFormDataChange, isFormReady = false, showSubmit = false, onSubmit, isLoading = false, onClose }: StudentFormProps) {
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");

    // Memoize entity title to prevent re-renders on keystroke
    const entityTitle = useMemo(() => {
        const name = [formData.firstName, formData.lastName].filter(Boolean).join(" ");
        return name || "New Student";
    }, [formData.firstName, formData.lastName]);

    const handleClear = useCallback(() => {
        onFormDataChange(defaultStudentForm);
    }, [onFormDataChange]);

    const handleLanguageToggle = useCallback((language: string) => {
        onFormDataChange((prevData: StudentFormData) => {
            const newLanguages = prevData.languages.includes(language)
                ? prevData.languages.filter((l) => l !== language)
                : [...prevData.languages, language];
            return { ...prevData, languages: newLanguages };
        });
    }, [onFormDataChange]);

    const handleCustomLanguageAdd = useCallback((language: string) => {
        onFormDataChange((prevData: StudentFormData) => {
            if (!prevData.languages.includes(language)) {
                const newLanguages = [...prevData.languages, language];
                return { ...prevData, languages: newLanguages };
            }
            return prevData;
        });
    }, [onFormDataChange]);

    const updateField = useCallback((field: keyof StudentFormData, value: string | string[] | boolean) => {
        onFormDataChange((prevData: StudentFormData) => {
            return { ...prevData, [field]: value };
        });
    }, [onFormDataChange]);

    const getFieldError = (field: keyof StudentFormData): string | undefined => {
        try {
            studentFormSchema.shape[field].parse(formData[field]);
            return undefined;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return error.issues[0]?.message;
            }
            return undefined;
        }
    };

    const isFieldValid = (field: keyof StudentFormData): boolean => {
        return getFieldError(field) === undefined && !!formData[field];
    };

    const formContent = (
        <>
            {/* Name Fields */}
            <NameFields
                firstName={formData.firstName}
                lastName={formData.lastName}
                onFirstNameChange={(value) => updateField("firstName", value)}
                onLastNameChange={(value) => updateField("lastName", value)}
                firstNameError={getFieldError("firstName")}
                lastNameError={getFieldError("lastName")}
                firstNameIsValid={isFieldValid("firstName")}
                lastNameIsValid={isFieldValid("lastName")}
                autoFocus={true}
            />

            {/* Country & Phone */}
            <CountryFlagPhoneSubForm
                onCountryChange={(country) => updateField("country", country)}
                onPhoneChange={(phone) => updateField("phone", phone)}
                countryValue={formData.country}
                countryError={getFieldError("country")}
                phoneError={getFieldError("phone")}
                countryIsValid={isFieldValid("country")}
                phoneIsValid={isFieldValid("phone")}
            />

            {/* Passport */}
            <PassportField passport={formData.passport} onPassportChange={(value) => updateField("passport", value)} passportError={getFieldError("passport")} passportIsValid={isFieldValid("passport")} />

            {/* Languages */}
            <LanguagesField languages={formData.languages} onLanguageToggle={handleLanguageToggle} onCustomLanguageAdd={handleCustomLanguageAdd} languagesError={getFieldError("languages")} />

            {/* Description */}
            <DescriptionField description={formData.description || ""} onDescriptionChange={(value) => updateField("description", value)} />

            {/* Can Rent */}
            <CanRentField canRent={formData.canRent} onCanRentChange={(value) => updateField("canRent", value)} />
        </>
    );

    return (
        <MasterSchoolForm
            icon={studentEntity?.icon}
            color={studentEntity?.color}
            entityTitle={entityTitle}
            isFormReady={isFormReady}
            onSubmit={onSubmit || (() => Promise.resolve())}
            onCancel={onClose || (() => {})}
            onClear={handleClear}
            isLoading={isLoading}
            submitLabel="Add Student"
        >
            {formContent}
        </MasterSchoolForm>
    );
}
