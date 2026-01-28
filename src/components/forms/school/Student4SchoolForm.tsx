"use client";

import { useCallback, useMemo, memo, useState } from "react";
import { z } from "zod";
import { ENTITY_DATA } from "@/config/entities";
import { CountryFlagPhoneSubForm } from "../CountryFlagPhoneSubForm";
import { FormField, FormInput } from "@/src/components/ui/form";
import { LANGUAGES } from "@/supabase/db/enums";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import { MasterSchoolForm, useMasterForm } from "./MasterSchoolForm";
import { studentCreateSchema, defaultStudentForm, type StudentCreateForm } from "@/src/validation/student";
import FormMultiSelect from "@/src/components/ui/form/form-multi-select";
import FormTextarea from "@/src/components/ui/form/form-textarea";

// Export the language options from the enum
export const LANGUAGE_OPTIONS = Object.values(LANGUAGES);

// Re-export for backward compatibility (using the new type)
export { studentCreateSchema as studentFormSchema, type StudentCreateForm as StudentFormData };

interface StudentFormProps {
    formData: StudentCreateForm;
    onFormDataChange: (data: StudentCreateForm) => void;
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
                    value={firstName || ""}
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
                    value={lastName || ""}
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
                value={passport || ""}
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

// Sub-component: Description Field
const DescriptionField = memo(function DescriptionField({
    description,
    onDescriptionChange,
}: {
    description: string;
    onDescriptionChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Description</label>
            <FormTextarea
                value={description || ""}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Add any additional notes..."
                rows={4}
            />
        </div>
    );
});

// Sub-component: Can Rent Toggle
const CanRentField = memo(function CanRentField({
    canRent,
    onCanRentChange,
}: {
    canRent: boolean;
    onCanRentChange: (value: boolean) => void;
}) {
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

export default function StudentForm({

    formData,

    onFormDataChange,

    isFormReady = false,

    showSubmit = true,

    onSubmit,

    isLoading = false,

    onClose,

}: StudentFormProps) {

    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");

    const rentalColor = "#ef4444"; // Red for rental

    const activeColor = formData.rental ? rentalColor : studentEntity?.color;



    // Memoize entity title to prevent re-renders on keystroke

    const entityTitle = useMemo(() => {

        const name = [formData.first_name, formData.last_name].filter(Boolean).join(" ");

        return name || "New Student";

    }, [formData.first_name, formData.last_name]);



    // Track which fields have been touched/interacted with

    const [touchedFields, setTouchedFields] = useState<Set<keyof StudentCreateForm>>(new Set());

    

    // Get hasSubmitted from MasterSchoolForm context

    const { hasSubmitted } = useMasterForm();



    const handleClear = useCallback(() => {

        setTouchedFields(new Set());

        onFormDataChange(defaultStudentForm);

    }, [onFormDataChange]);



    const handleFieldTouch = useCallback((field: keyof StudentCreateForm) => {

        setTouchedFields((prev) => new Set(prev).add(field));

    }, []);



    const updateField = useCallback(

        (field: keyof StudentCreateForm, value: string | string[] | boolean) => {

            handleFieldTouch(field);

            onFormDataChange((prevData: StudentCreateForm) => {

                return { ...prevData, [field]: value };

            });

        },

        [onFormDataChange, handleFieldTouch],

    );



    const getFieldError = (field: keyof StudentCreateForm): string | undefined => {

        // Only show error if field has been touched or form has been submitted

        if (!touchedFields.has(field) && !hasSubmitted) {

            return undefined;

        }

        

        try {

            studentCreateSchema.shape[field].parse(formData[field]);

            return undefined;

        } catch (error) {

            if (error instanceof z.ZodError) {

                return error.issues[0]?.message;

            }

            return undefined;

        }

    };



    const isFieldValid = (field: keyof StudentCreateForm): boolean => {

        return getFieldError(field) === undefined && !!formData[field];

    };



    const formContent = (

        <>

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



            {/* Description */}

            <DescriptionField

                description={formData.description || ""}

                onDescriptionChange={(value) => updateField("description", value)}

            />



            {/* Can Rent */}

            <CanRentField 

                canRent={formData.rental} 

                onCanRentChange={(value) => updateField("rental", value)} 

            />

        </>

    );



    return (

        <MasterSchoolForm

            icon={studentEntity?.icon}

            color={formData.rental ? "#ef4444" : studentEntity?.color}

                        entityTitle={entityTitle}

                                    isFormReady={isFormReady}

                                    onSubmit={onSubmit || (() => Promise.resolve())}

                                    onCancel={onClose || (() => { /* no-op */ })}

                                    onClear={handleClear}

            isLoading={isLoading}

            showSubmit={showSubmit}

            submitLabel="Add Student"

        >

            {formContent}

        </MasterSchoolForm>

    );

}
