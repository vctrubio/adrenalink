"use client";

import { useState } from "react";
import { z } from "zod";
import { ENTITY_DATA } from "@/config/entities";
import { CountryFlagPhoneSubForm } from "./CountryFlagPhoneSubForm";
import { FormField, FormInput } from "@/src/components/ui/form";
import { languagesEnum } from "@/drizzle/schema";

// Export the language options from the enum
export const LANGUAGE_OPTIONS = languagesEnum.enumValues;

// Zod schema for validation
export const studentFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    passport: z.string().min(1, "Passport is required"),
    country: z.string().min(1, "Country is required"),
    phone: z.string().min(1, "Phone number is required"),
    languages: z.array(z.string()).min(1, "At least one language is required"),
    description: z.string().optional(),
    canRent: z.boolean().default(false),
});

export type StudentFormData = z.infer<typeof studentFormSchema>;

interface StudentFormProps {
    formData: StudentFormData;
    onFormDataChange: (data: StudentFormData) => void;
    isFormReady?: boolean;
    showSubmit?: boolean;
    onSubmit?: () => void;
    isLoading?: boolean;
}

// Sub-component: Name Fields
function NameFields({
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
            <FormField
                label="First Name"
                required
                error={firstNameError}
                isValid={firstNameIsValid}
            >
                <FormInput
                    type="text"
                    value={firstName}
                    onChange={(e) => onFirstNameChange(e.target.value)}
                    placeholder="Enter first name"
                    error={!!firstNameError}
                    autoFocus={autoFocus}
                />
            </FormField>
            <FormField
                label="Last Name"
                required
                error={lastNameError}
                isValid={lastNameIsValid}
            >
                <FormInput
                    type="text"
                    value={lastName}
                    onChange={(e) => onLastNameChange(e.target.value)}
                    placeholder="Enter last name"
                    error={!!lastNameError}
                />
            </FormField>
        </div>
    );
}

// Sub-component: Passport Field
function PassportField({
    passport,
    onPassportChange,
    passportError,
    passportIsValid,
}: {
    passport: string;
    onPassportChange: (value: string) => void;
    passportError?: string;
    passportIsValid?: boolean;
}) {
    return (
        <FormField
            label="Passport"
            required
            error={passportError}
            isValid={passportIsValid}
        >
            <FormInput
                type="text"
                value={passport}
                onChange={(e) => onPassportChange(e.target.value)}
                placeholder="Enter passport number"
                error={!!passportError}
            />
        </FormField>
    );
}

// Sub-component: Languages Selection
function LanguagesField({
    languages,
    onLanguageToggle,
    onCustomLanguageAdd,
    languagesError,
}: {
    languages: string[];
    onLanguageToggle: (language: string) => void;
    onCustomLanguageAdd: (language: string) => void;
    languagesError?: string;
}) {
    const [customLanguage, setCustomLanguage] = useState("");
    const [showOtherInput, setShowOtherInput] = useState(false);

    const handleAddCustomLanguage = () => {
        if (customLanguage.trim()) {
            onCustomLanguageAdd(customLanguage.trim());
            setCustomLanguage("");
            setShowOtherInput(false);
        }
    };

    const handleRemoveLanguage = (language: string) => {
        onLanguageToggle(language);
    };

    const standardLanguages = languages.filter((lang) => 
        LANGUAGE_OPTIONS.includes(lang as typeof LANGUAGE_OPTIONS[number])
    );
    const customLanguages = languages.filter((lang) => 
        !LANGUAGE_OPTIONS.includes(lang as typeof LANGUAGE_OPTIONS[number])
    );

    return (
        <FormField
            label="Languages"
            required
            error={languagesError}
            isValid={languages.length > 0}
        >
            <div className="space-y-3">
                {/* Standard language buttons */}
                <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map((language) => (
                        <button
                            key={language}
                            type="button"
                            onClick={() => onLanguageToggle(language)}
                            className={`px-4 py-2 text-sm font-medium rounded-md border-2 transition-all ${
                                standardLanguages.includes(language)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-foreground border-input hover:border-primary/50"
                            }`}
                        >
                            {language}
                        </button>
                    ))}
                    
                    {/* Other button */}
                    <button
                        type="button"
                        onClick={() => setShowOtherInput(!showOtherInput)}
                        className={`px-4 py-2 text-sm font-medium rounded-md border-2 transition-all ${
                            showOtherInput
                                ? "bg-secondary text-secondary-foreground border-secondary"
                                : "bg-background text-foreground border-input hover:border-secondary/50"
                        }`}
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
                        <button
                            type="button"
                            onClick={handleAddCustomLanguage}
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
                                className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground border-2 border-secondary flex items-center gap-2"
                            >
                                {language}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveLanguage(language)}
                                    className="text-xs hover:text-destructive"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </FormField>
    );
}

// Sub-component: Description Field
function DescriptionField({
    description,
    onDescriptionChange,
}: {
    description: string;
    onDescriptionChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
                Description
            </label>
            <textarea
                value={description || ""}
                onChange={(e) => onDescriptionChange(e.target.value)}
                rows={4}
                placeholder="Add any additional notes..."
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
        </div>
    );
}

// Sub-component: Can Rent Toggle
function CanRentField({
    canRent,
    onCanRentChange,
}: {
    canRent: boolean;
    onCanRentChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center space-x-3">
            <input
                type="checkbox"
                id="canRent"
                checked={canRent}
                onChange={(e) => onCanRentChange(e.target.checked)}
                className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="canRent" className="text-sm font-medium text-foreground cursor-pointer">
                Student can rent equipment
            </label>
        </div>
    );
}

// Main component - ONLY RENDERS
export default function StudentForm({ formData, onFormDataChange, isFormReady = false, showSubmit = false, onSubmit, isLoading = false }: StudentFormProps) {
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const StudentIcon = studentEntity?.icon;

    const handleLanguageToggle = (language: string) => {
        const newLanguages = formData.languages.includes(language)
            ? formData.languages.filter((l) => l !== language)
            : [...formData.languages, language];
        onFormDataChange({ ...formData, languages: newLanguages });
    };

    const handleCustomLanguageAdd = (language: string) => {
        if (!formData.languages.includes(language)) {
            const newLanguages = [...formData.languages, language];
            onFormDataChange({ ...formData, languages: newLanguages });
        }
    };

    const updateField = (field: keyof StudentFormData, value: string | string[] | boolean) => {
        onFormDataChange({ ...formData, [field]: value });
    };

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

    return (
        <div className="space-y-6">
            {/* Header with Icon */}
            <div className="flex items-center gap-3">
                {StudentIcon && (
                    <div 
                        className="w-10 h-10 flex items-center justify-center transition-all duration-300"
                        style={{
                            color: isFormReady ? studentEntity?.color : "#94a3b8",
                        }}
                    >
                        <StudentIcon className="w-10 h-10 transition-all duration-300" />
                    </div>
                )}
                <h2 
                    className="text-2xl font-bold px-4 py-1 rounded-md"
                    style={{ backgroundColor: studentEntity?.bgColor }}
                >
                    Create New Student
                </h2>
            </div>

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
            <PassportField
                passport={formData.passport}
                onPassportChange={(value) => updateField("passport", value)}
                passportError={getFieldError("passport")}
                passportIsValid={isFieldValid("passport")}
            />

            {/* Languages */}
            <LanguagesField
                languages={formData.languages}
                onLanguageToggle={handleLanguageToggle}
                onCustomLanguageAdd={handleCustomLanguageAdd}
                languagesError={getFieldError("languages")}
            />

            {/* Description */}
            <DescriptionField
                description={formData.description || ""}
                onDescriptionChange={(value) => updateField("description", value)}
            />

            {/* Can Rent */}
            <CanRentField
                canRent={formData.canRent}
                onCanRentChange={(value) => updateField("canRent", value)}
            />
        </div>
    );
}
