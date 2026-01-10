"use client";

import { useCallback, useMemo, memo, useState } from "react";
import { z } from "zod";
import { ENTITY_DATA } from "@/config/entities";
import { CountryFlagPhoneSubForm } from "../CountryFlagPhoneSubForm";
import { FormField, FormInput } from "@/src/components/ui/form";
import { LANGUAGES } from "@/supabase/db/enums";
import { CommissionTypeValue } from "@/src/components/ui/badge/commission-type-value";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { X } from "lucide-react";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import { FORM_SUMMARY_COLORS } from "@/types/form-summary";
import { MasterSchoolForm } from "./MasterSchoolForm";
import { teacherFormSchema, defaultTeacherForm, type TeacherFormData } from "@/types/form-entities";

// Export the language options from the enum
export const LANGUAGE_OPTIONS = Object.values(LANGUAGES);

// Re-export for backward compatibility
export { teacherFormSchema, type TeacherFormData };

interface TeacherFormProps {
    formData: TeacherFormData;
    onFormDataChange: (data: TeacherFormData) => void;
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
                <FormInput
                    type="text"
                    value={firstName}
                    onChange={(e) => onFirstNameChange(e.target.value)}
                    placeholder="Enter first name"
                    error={!!firstNameError}
                    autoFocus={autoFocus}
                />
            </FormField>
            <FormField label="Last Name" required error={lastNameError} isValid={lastNameIsValid}>
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
});

// Sub-component: Username Field
const UsernameField = memo(function UsernameField({
    username,
    onUsernameChange,
    usernameError,
    usernameIsValid,
}: {
    username: string;
    onUsernameChange: (value: string) => void;
    usernameError?: string;
    usernameIsValid?: boolean;
}) {
    return (
        <FormField label="Username" required error={usernameError} isValid={usernameIsValid}>
            <FormInput
                type="text"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value.toLowerCase())}
                placeholder="teacher_username"
                error={!!usernameError}
            />
            <p className="text-xs text-muted-foreground mt-1">Lowercase letters, numbers, dashes, or underscores only</p>
        </FormField>
    );
});

// Sub-component: Passport Field
const PassportField = memo(function PassportField({
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
        <FormField label="Passport" required error={passportError} isValid={passportIsValid}>
            <FormInput
                type="text"
                value={passport}
                onChange={(e) => onPassportChange(e.target.value)}
                placeholder="Enter passport number"
                error={!!passportError}
            />
        </FormField>
    );
});

// Sub-component: Commissions List
const CommissionsListField = memo(function CommissionsListField({
    commissions,
    onAddCommission,
    onRemoveCommission,
    currency,
    commissionColor,
}: {
    commissions: Array<{ id: string; commissionType: "fixed" | "percentage"; commissionValue: string; commissionDescription: string }>;
    onAddCommission: (commission: {
        commissionType: "fixed" | "percentage";
        commissionValue: string;
        commissionDescription: string;
    }) => void;
    onRemoveCommission: (id: string) => void;
    currency: string;
    commissionColor: string;
}) {
    const [commissionType, setCommissionType] = useState<"fixed" | "percentage">("fixed");
    const [commissionValue, setCommissionValue] = useState("");
    const [commissionDescription, setCommissionDescription] = useState("");

    const handleAdd = useCallback(() => {
        if (commissionValue.trim()) {
            onAddCommission({
                commissionType,
                commissionValue,
                commissionDescription,
            });
            setCommissionValue("");
            setCommissionDescription("");
            setCommissionType("fixed");
        }
    }, [commissionType, commissionValue, commissionDescription, onAddCommission]);

    return (
        <FormField label="Commissions" required={false}>
            <div className="space-y-3">
                {/* Staged Commissions List */}
                {commissions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {commissions.map((commission) => (
                            <div key={commission.id} className="relative group">
                                <CommissionTypeValue
                                    value={commission.commissionValue}
                                    type={commission.commissionType}
                                    description={commission.commissionDescription}
                                />
                                <button
                                    type="button"
                                    onClick={() => onRemoveCommission(commission.id)}
                                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-destructive/20 hover:bg-destructive/30 rounded-full"
                                >
                                    <X size={12} className="text-destructive" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Commission Form */}
                <div className="rounded-xl bg-muted/10 border border-border/30 p-3 space-y-3">
                    {/* Type Selection */}
                    <div className="flex gap-4">
                        {(["fixed", "percentage"] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setCommissionType(type)}
                                className={`text-sm font-medium pb-1 transition-colors ${
                                    commissionType === type
                                        ? "text-foreground border-b-2 border-foreground"
                                        : "text-muted-foreground hover:text-foreground border-b border-transparent"
                                }`}
                            >
                                {type === "fixed" ? `Fixed (${currency}/hr)` : "Percentage (%)"}
                            </button>
                        ))}
                    </div>

                    {/* Value and Description */}
                    <div className="flex gap-2">
                        <div className="relative w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                                {commissionType === "fixed" ? currency : "%"}
                            </span>
                            <input
                                type="number"
                                value={commissionValue}
                                onChange={(e) => setCommissionValue(e.target.value)}
                                placeholder="0"
                                min="0"
                                step="0.01"
                                className="w-full pl-12 pr-3 py-2.5 h-10 rounded-xl bg-muted/30 border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <input
                            type="text"
                            value={commissionDescription}
                            onChange={(e) => setCommissionDescription(e.target.value)}
                            placeholder="Notes (optional)"
                            className="flex-1 px-3 py-2.5 h-10 rounded-xl bg-muted/30 border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={!commissionValue}
                            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/90 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </FormField>
    );
});

// Sub-component: Languages Selection
const LanguagesField = memo(function LanguagesField({
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

    const handleAddCustomLanguage = useCallback(() => {
        if (customLanguage.trim()) {
            onCustomLanguageAdd(customLanguage.trim());
            setCustomLanguage("");
            setShowOtherInput(false);
        }
    }, [customLanguage, onCustomLanguageAdd]);

    const handleRemoveLanguage = useCallback(
        (language: string) => {
            onLanguageToggle(language);
        },
        [onLanguageToggle],
    );

    const { standardLanguages, customLanguages } = useMemo(
        () => ({
            standardLanguages: languages.filter((lang) => LANGUAGE_OPTIONS.includes(lang as (typeof LANGUAGE_OPTIONS)[number])),
            customLanguages: languages.filter((lang) => !LANGUAGE_OPTIONS.includes(lang as (typeof LANGUAGE_OPTIONS)[number])),
        }),
        [languages],
    );

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
                            className={`px-4 py-2 text-sm font-medium rounded-md border-2 transition-all ${
                                standardLanguages.includes(language)
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
                        className={`px-4 py-2 text-sm font-medium rounded-md border-2 transition-all ${
                            showOtherInput
                                ? `${FORM_SUMMARY_COLORS.required.bg} border-green-300 dark:border-green-700 text-foreground`
                                : "bg-background text-foreground border-input hover:border-green-300/50"
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
                                className={`px-4 py-2 text-sm font-medium rounded-md border-2 border-green-300 dark:border-green-700 ${FORM_SUMMARY_COLORS.required.bg} text-foreground flex items-center gap-2`}
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
});

// Main component - ONLY RENDERS
export default function TeacherForm({
    formData,
    onFormDataChange,
    isFormReady = false,
    showSubmit = false,
    onSubmit,
    isLoading = false,
    onClose,
}: TeacherFormProps) {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
    const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission");
    const credentials = useSchoolCredentials();
    const currency = credentials.currency || "YEN";

    // Memoize entity title to prevent re-renders on keystroke
    const entityTitle = useMemo(() => {
        const name = [formData.firstName, formData.lastName].filter(Boolean).join(" ");
        return name || "New Teacher";
    }, [formData.firstName, formData.lastName]);

    const handleClear = useCallback(() => {
        onFormDataChange(defaultTeacherForm);
    }, [onFormDataChange]);

    const handleLanguageToggle = useCallback(
        (language: string) => {
            onFormDataChange((prevData: TeacherFormData) => {
                const newLanguages = prevData.languages.includes(language)
                    ? prevData.languages.filter((l) => l !== language)
                    : [...prevData.languages, language];
                return { ...prevData, languages: newLanguages };
            });
        },
        [onFormDataChange],
    );

    const handleCustomLanguageAdd = useCallback(
        (language: string) => {
            onFormDataChange((prevData: TeacherFormData) => {
                if (!prevData.languages.includes(language)) {
                    const newLanguages = [...prevData.languages, language];
                    return { ...prevData, languages: newLanguages };
                }
                return prevData;
            });
        },
        [onFormDataChange],
    );

    const updateField = useCallback(
        (field: keyof TeacherFormData, value: string | string[]) => {
            onFormDataChange((prevData: TeacherFormData) => {
                return { ...prevData, [field]: value };
            });
        },
        [onFormDataChange],
    );

    const getFieldError = (field: keyof TeacherFormData): string | undefined => {
        try {
            teacherFormSchema.shape[field].parse(formData[field]);
            return undefined;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return error.issues[0]?.message;
            }
            return undefined;
        }
    };

    const isFieldValid = (field: keyof TeacherFormData): boolean => {
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

            {/* Username */}
            <UsernameField
                username={formData.username}
                onUsernameChange={(value) => updateField("username", value)}
                usernameError={getFieldError("username")}
                usernameIsValid={isFieldValid("username")}
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

            {/* Commissions Section */}
            <div className="border-t pt-6 mt-6">
                <CommissionsListField
                    commissions={formData.commissions}
                    currency={currency}
                    commissionColor={commissionEntity?.color || "#10b981"}
                    onAddCommission={(commission) => {
                        const newCommission = {
                            id: `temp-${Date.now()}`,
                            ...commission,
                        };
                        onFormDataChange((prevData) => ({
                            ...prevData,
                            commissions: [...prevData.commissions, newCommission],
                        }));
                    }}
                    onRemoveCommission={(id) => {
                        onFormDataChange((prevData) => ({
                            ...prevData,
                            commissions: prevData.commissions.filter((c) => c.id !== id),
                        }));
                    }}
                />
            </div>
        </>
    );

    return (
        <MasterSchoolForm
            icon={teacherEntity?.icon}
            color={teacherEntity?.color}
            entityTitle={entityTitle}
            isFormReady={isFormReady}
            onSubmit={onSubmit || (() => Promise.resolve())}
            onCancel={onClose || (() => {})}
            onClear={handleClear}
            isLoading={isLoading}
            submitLabel="Add Teacher"
        >
            {formContent}
        </MasterSchoolForm>
    );
}
