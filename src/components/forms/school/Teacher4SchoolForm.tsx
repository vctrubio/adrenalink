"use client";

import { useCallback, useMemo, memo, useState, useEffect } from "react";
import { z } from "zod";
import { ENTITY_DATA } from "@/config/entities";
import { CountryFlagPhoneSubForm } from "../CountryFlagPhoneSubForm";
import { FormField, FormInput } from "@/src/components/ui/form";
import { LANGUAGES } from "@/supabase/db/enums";
import { CommissionTypeValue } from "@/src/components/ui/badge/commission-type-value";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { X } from "lucide-react";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { MasterSchoolForm } from "./MasterSchoolForm";
import { teacherCreateSchema, defaultTeacherForm, type TeacherCreateForm } from "@/src/validation/teacher";
import FormMultiSelect from "@/src/components/ui/form/form-multi-select";

// Export the language options from the enum
export const LANGUAGE_OPTIONS = Object.values(LANGUAGES);

// Re-export for backward compatibility
export { teacherCreateSchema as teacherFormSchema, type TeacherCreateForm as TeacherFormData };

interface TeacherFormProps {
    formData: TeacherCreateForm;
    onFormDataChange: (data: TeacherCreateForm) => void;
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
    onFieldTouch,
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
    onFieldTouch: (field: "first_name" | "last_name") => void;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="First Name" required error={firstNameError} isValid={firstNameIsValid}>
                <FormInput
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                        onFieldTouch("first_name");
                        onFirstNameChange(e.target.value);
                    }}
                    placeholder="Enter first name"
                    error={!!firstNameError}
                    autoFocus={autoFocus}
                />
            </FormField>
            <FormField label="Last Name" required error={lastNameError} isValid={lastNameIsValid}>
                <FormInput
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                        onFieldTouch("last_name");
                        onLastNameChange(e.target.value);
                    }}
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
    onFieldTouch,
}: {
    username: string;
    onUsernameChange: (value: string) => void;
    usernameError?: string;
    usernameIsValid?: boolean;
    onFieldTouch: () => void;
}) {
    return (
        <FormField label="Username" required error={usernameError} isValid={usernameIsValid}>
            <FormInput
                type="text"
                value={username}
                onChange={(e) => {
                    onFieldTouch();
                    onUsernameChange(e.target.value.toLowerCase());
                }}
                placeholder="teacher_username"
                error={!!usernameError}
            />
            {/* <p className="text-xs text-muted-foreground mt-1">Lowercase letters, numbers, dashes, or underscores only</p> */}
        </FormField>
    );
});

// Sub-component: Passport Field
const PassportField = memo(function PassportField({
    passport,
    onPassportChange,
    passportError,
    passportIsValid,
    onFieldTouch,
}: {
    passport: string;
    onPassportChange: (value: string) => void;
    passportError?: string;
    passportIsValid?: boolean;
    onFieldTouch: () => void;
}) {
    return (
        <FormField label="Passport" required error={passportError} isValid={passportIsValid}>
            <FormInput
                type="text"
                value={passport}
                onChange={(e) => {
                    onFieldTouch();
                    onPassportChange(e.target.value);
                }}
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
    commissions: { id: string; commission_type: "fixed" | "percentage"; cph: number; description: string }[];
    onAddCommission: (commission: {
        commission_type: "fixed" | "percentage";
        cph: number;
        description: string;
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
                commission_type: commissionType,
                cph: parseFloat(commissionValue),
                description: commissionDescription,
            });
            setCommissionValue("");
            setCommissionDescription("");
            setCommissionType("fixed");
        }
    }, [commissionType, commissionValue, commissionDescription, onAddCommission]);

    return (
        <FormField
            label={
                <div className="flex items-center gap-2">
                    <HandshakeIcon size={16} className="text-emerald-500" />
                    <span>Commissions</span>
                </div>
            }
            required={false}
        >
            <div className="space-y-3">
                {/* Staged Commissions List */}
                {commissions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {commissions.map((commission) => (
                            <div key={commission.id} className="relative group">
                                <CommissionTypeValue
                                    value={commission.cph.toString()}
                                    type={commission.commission_type}
                                    description={commission.description || ""}
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
                                className={`text-sm font-medium pb-1 transition-colors ${commissionType === type
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
    onLanguageChange,
    languagesError,
    onFieldTouch,
}: {
    languages: string[];
    onLanguageChange: (languages: string[]) => void;
    languagesError?: string;
    onFieldTouch: () => void;
}) {
    return (
        <FormField label="Languages" required error={languagesError} isValid={languages.length > 0}>
            <FormMultiSelect
                options={LANGUAGE_OPTIONS}
                value={languages}
                onChange={(val) => {
                    onFieldTouch();
                    onLanguageChange(val as string[]);
                }}
                multi={true}
                allowCustom={true}
                customLabel="Other"
                placeholder="Enter language name"
            />
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

    // Debug validation
    useEffect(() => {
        if (!isFormReady) {
            const result = teacherCreateSchema.safeParse(formData);
            if (!result.success) {
                console.log("[TeacherForm] Validation Errors:", result.error.flatten().fieldErrors);
            } else {
                console.log("[TeacherForm] Schema is valid, but isFormReady is false. Check parent logic.");
            }
        }
    }, [isFormReady, formData]);

    // Memoize entity title to prevent re-renders on keystroke
    const entityTitle = useMemo(() => {
        return formData.username || "New Teacher";
    }, [formData.username]);

    // Track which fields have been touched/interacted with
    const [touchedFields, setTouchedFields] = useState<Set<keyof TeacherCreateForm>>(new Set());
    // Track if form has been submitted (attempted)
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const handleClear = useCallback(() => {
        setTouchedFields(new Set());
        setHasSubmitted(false);
        onFormDataChange(defaultTeacherForm);
    }, [onFormDataChange]);

    const handleFieldTouch = useCallback((field: keyof TeacherCreateForm) => {
        setTouchedFields((prev) => new Set(prev).add(field));
    }, []);

    const updateField = useCallback(
        (field: keyof TeacherCreateForm, value: any) => {
            handleFieldTouch(field);
            onFormDataChange((prevData: TeacherCreateForm) => {
                return { ...prevData, [field]: value };
            });
        },
        [onFormDataChange, handleFieldTouch],
    );

    const getFieldError = (field: keyof TeacherCreateForm): string | undefined => {
        // Only show error if field has been touched or form has been submitted
        if (!touchedFields.has(field) && !hasSubmitted) {
            return undefined;
        }

        try {
            teacherCreateSchema.shape[field].parse(formData[field]);
            return undefined;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return error.issues[0]?.message;
            }
            return undefined;
        }
    };

    const isFieldValid = (field: keyof TeacherCreateForm): boolean => {
        return getFieldError(field) === undefined && !!formData[field];
    };

    const handleSubmit = useCallback(async () => {
        setHasSubmitted(true);
        // Mark all fields as touched when submitting
        const allFields: (keyof TeacherCreateForm)[] = [
            "first_name",
            "last_name",
            "username",
            "country",
            "phone",
            "passport",
            "languages",
        ];
        setTouchedFields(new Set(allFields));

        if (onSubmit) {
            await onSubmit();
        }
    }, [onSubmit]);

    const submitLabel = useMemo(() => {
        const commissionCount = formData.commissions.length;
        if (commissionCount > 0) {
            return `Add Teacher + ${commissionCount} Commission${commissionCount > 1 ? "s" : ""}`;
        }
        return "Add Teacher";
    }, [formData.commissions.length]);

    const formContent = (
        <>
            {/* Username */}
            <UsernameField
                username={formData.username}
                onUsernameChange={(value) => updateField("username", value)}
                usernameError={getFieldError("username")}
                usernameIsValid={isFieldValid("username")}
                onFieldTouch={() => handleFieldTouch("username")}
            />

            {/* Name Fields */}
            <NameFields
                firstName={formData.first_name}
                lastName={formData.last_name}
                onFirstNameChange={(value) => updateField("first_name", value)}
                onLastNameChange={(value) => updateField("last_name", value)}
                firstNameError={getFieldError("first_name")}
                lastNameError={getFieldError("last_name")}
                firstNameIsValid={isFieldValid("first_name")}
                lastNameIsValid={isFieldValid("last_name")}
                autoFocus={true}
                onFieldTouch={(field) => handleFieldTouch(field)}
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
                onFieldTouch={() => handleFieldTouch("passport")}
            />

            {/* Languages */}
            <LanguagesField
                languages={formData.languages}
                onLanguageChange={(value) => updateField("languages", value)}
                languagesError={getFieldError("languages")}
                onFieldTouch={() => handleFieldTouch("languages")}
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
            onSubmit={handleSubmit}
            onCancel={() => {
                handleClear();
                onClose?.();
            }}
            onClear={handleClear}
            isLoading={isLoading}
            submitLabel={submitLabel}
        >
            {formContent}
        </MasterSchoolForm>
    );
}
