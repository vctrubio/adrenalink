"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { LeftColumnCard } from "./LeftColumnCard";
import { Card } from "@/src/components/ui/card";
import { CardList } from "@/src/components/ui/card/card-list";
import FormField from "@/src/components/ui/form/form-field";
import FormInput from "@/src/components/ui/form/form-input";
import FormSelect from "@/src/components/ui/form/form-select";
import FormCountryPhone from "@/src/components/ui/form/form-country-phone";
import FormLanguages from "@/src/components/ui/form/form-languages";
import { SubmitDeleteCancelReset } from "@/src/components/ui/SubmitDeleteCancelReset";
import { ENTITY_DATA } from "@/config/entities";

type FieldType = "text" | "select" | "checkbox" | "textarea" | "phone" | "multi-select" | "switch" | "country-phone" | "languages";

interface FormFieldConfig {
    name: string;
    label: string;
    type: FieldType;
    options?: { value: string; label: string }[];
    placeholder?: string;
    disabled?: boolean;
    section?: string;
    pairedField?: string; // For country-phone type, specify the paired field name
    required?: boolean;
    description?: string; // Optional description for switches and other fields
}

interface UpdateEntityColumnCardProps<T extends z.ZodType<any, any>> {
    // View mode props
    name: string | ((formValues: z.infer<T>) => string);
    status: ReactNode;
    avatar: ReactNode | ((formValues: z.infer<T>) => ReactNode);
    fields: { label: string; value: string | ReactNode }[];
    accentColor: string | ((formValues: z.infer<T>) => string);
    isAddable?: boolean;
    onAdd?: () => void;

    // Edit mode props
    entityId: string;
    formFields: FormFieldConfig[];
    schema: T;
    defaultValues: z.infer<T>;
    onSubmit: (data: z.infer<T>) => Promise<void>;
    onDelete?: () => Promise<void>;
    canDelete?: boolean;
    deleteMessage?: string;
}

export function UpdateEntityColumnCard<T extends z.ZodType<any, any>>({
    name,
    status,
    avatar,
    fields,
    accentColor,
    isAddable = false,
    onAdd,
    entityId,
    formFields,
    schema,
    defaultValues,
    onSubmit,
    onDelete,
    canDelete = false,
    deleteMessage = "Are you sure you want to delete this item?",
}: UpdateEntityColumnCardProps<T>) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const entity = ENTITY_DATA.find((e) => e.id === entityId);
    const EntityIcon = entity?.icon;

    const methods = useForm<z.infer<T>>({
        resolver: zodResolver(schema),
        defaultValues,
        mode: "onChange",
    });

    useEffect(() => {
        if (isEditing) {
            methods.reset(defaultValues);
        }
    }, [isEditing, defaultValues]);

    // Watch form values for dynamic updates
    const formValues = useWatch({ control: methods.control }) as z.infer<T>;

    // Check if form has changes
    const hasChanges = useMemo(() => {
        if (!formValues) return false;
        return JSON.stringify(formValues) !== JSON.stringify(defaultValues);
    }, [formValues, defaultValues]);

    // Compute dynamic name
    const displayName = useMemo(() => {
        if (typeof name === "function") {
            return name(formValues || defaultValues);
        }
        return name;
    }, [name, formValues, defaultValues]);

    // Compute dynamic avatar
    const displayAvatar = useMemo(() => {
        if (typeof avatar === "function") {
            return avatar(formValues || defaultValues);
        }
        return avatar;
    }, [avatar, formValues, defaultValues]);

    // Compute dynamic color
    const displayColor = useMemo(() => {
        if (typeof accentColor === "function") {
            return accentColor(formValues || defaultValues);
        }
        return accentColor;
    }, [accentColor, formValues, defaultValues]);

    const handleSubmit = async (data: z.infer<T>) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
            setIsEditing(false);
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete) return;

        setIsDeleting(true);
        try {
            await onDelete();
            setIsEditing(false);
        } catch (error) {
            console.error("Error deleting:", error);
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    // Group fields by section
    const groupedFields = formFields.reduce((acc, field) => {
        const section = field.section || "other";
        if (!acc[section]) acc[section] = [];
        acc[section].push(field);
        return acc;
    }, {} as Record<string, FormFieldConfig[]>);

    // Check if a field is valid
    const isFieldValid = (fieldName: string): boolean => {
        const value = formValues?.[fieldName as keyof z.infer<T>];
        const error = methods.formState.errors[fieldName as keyof z.infer<T>];
        return !error && !!value && value !== "";
    };

    const getFieldError = (fieldName: string): string | undefined => {
        const error = methods.formState.errors[fieldName as keyof z.infer<T>];
        return error?.message as string | undefined;
    };

    const renderField = (field: FormFieldConfig) => {
        switch (field.type) {
            case "country-phone":
                // Country-phone is a special paired field
                const phoneField = field.pairedField || "phone";
                const countryValue = (formValues?.[field.name as keyof z.infer<T>] as string) || "";
                const phoneValue = (formValues?.[phoneField as keyof z.infer<T>] as string) || "";
                return (
                    <div key={field.name}>
                        <div className="mb-2 flex items-center gap-2">
                            <label className="text-sm font-medium text-foreground">Country & Phone</label>
                            {field.required && !isFieldValid(field.name) && <span className="text-destructive">*</span>}
                        </div>
                        <Controller
                            name={field.name as any}
                            control={methods.control}
                            render={() => (
                                <FormCountryPhone
                                    countryValue={countryValue}
                                    phoneValue={phoneValue}
                                    onCountryChange={(country) => methods.setValue(field.name as any, country, { shouldValidate: true })}
                                    onPhoneChange={(phone) => methods.setValue(phoneField as any, phone, { shouldValidate: true })}
                                    countryError={!!getFieldError(field.name)}
                                    phoneError={!!getFieldError(phoneField)}
                                    disabled={field.disabled}
                                />
                            )}
                        />
                    </div>
                );
            case "select":
                return (
                    <FormField
                        key={field.name}
                        label={field.label}
                        required={field.required}
                        error={getFieldError(field.name)}
                        isValid={isFieldValid(field.name)}
                    >
                        <FormSelect {...methods.register(field.name)} options={field.options || []} disabled={field.disabled} />
                    </FormField>
                );
            case "switch":
                return (
                    <div key={field.name} className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-foreground">{field.label}</label>
                            {field.description && <span className="text-xs text-muted-foreground">{field.description}</span>}
                        </div>
                        <Controller
                            name={field.name as any}
                            control={methods.control}
                            render={({ field: controllerField }) => (
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={controllerField.value}
                                    onClick={() => controllerField.onChange(!controllerField.value)}
                                    disabled={field.disabled}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                                        controllerField.value ? "bg-foreground/20" : "bg-muted/50"
                                    } ${field.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                                            controllerField.value ? "bg-foreground translate-x-6" : "bg-muted-foreground/40 translate-x-1"
                                        }`}
                                    />
                                </button>
                            )}
                        />
                    </div>
                );
            case "checkbox":
                return (
                    <div key={field.name} className="flex items-center gap-3 py-3 px-4 rounded-lg bg-muted/30 border border-border/50">
                        <input
                            type="checkbox"
                            {...methods.register(field.name)}
                            disabled={field.disabled}
                            className="h-5 w-5 rounded border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        />
                        <label className="text-sm font-medium text-foreground cursor-pointer">{field.label}</label>
                    </div>
                );
            case "languages":
                const languagesValue = (formValues?.[field.name as keyof z.infer<T>] as string | string[]) || [];
                const languagesArray = Array.isArray(languagesValue)
                    ? languagesValue
                    : typeof languagesValue === "string"
                      ? languagesValue.split(",").map((l) => l.trim()).filter(Boolean)
                      : [];
                return (
                    <FormField
                        key={field.name}
                        label={field.label}
                        required={field.required}
                        error={getFieldError(field.name)}
                        isValid={isFieldValid(field.name)}
                    >
                        <Controller
                            name={field.name as any}
                            control={methods.control}
                            render={() => (
                                <FormLanguages
                                    value={languagesArray}
                                    onChange={(langs) => methods.setValue(field.name as any, langs, { shouldValidate: true })}
                                    disabled={field.disabled}
                                />
                            )}
                        />
                    </FormField>
                );
            case "textarea":
                return (
                    <FormField
                        key={field.name}
                        label={field.label}
                        required={field.required}
                        error={getFieldError(field.name)}
                        isValid={isFieldValid(field.name)}
                    >
                        <textarea
                            {...methods.register(field.name)}
                            placeholder={field.placeholder}
                            disabled={field.disabled}
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                        />
                    </FormField>
                );
            default:
                return (
                    <FormField
                        key={field.name}
                        label={field.label}
                        required={field.required}
                        error={getFieldError(field.name)}
                        isValid={isFieldValid(field.name)}
                    >
                        <FormInput
                            {...methods.register(field.name)}
                            type={field.type === "phone" ? "tel" : "text"}
                            placeholder={field.placeholder}
                            disabled={field.disabled}
                            error={!!getFieldError(field.name)}
                        />
                    </FormField>
                );
        }
    };

    const renderSection = (sectionName: string, sectionFields: FormFieldConfig[]) => {
        const sectionTitles: Record<string, string> = {
            personal: "Personal Information",
            contact: "Contact Information",
            settings: "Settings",
        };

        const isPersonalSection = sectionName === "personal";
        const isSettingsSection = sectionName === "settings";

        return (
            <div key={sectionName} className="space-y-4">
                {sectionTitles[sectionName] && (
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">{sectionTitles[sectionName]}</h3>
                )}
                <div className={isSettingsSection ? "grid grid-cols-2 gap-3" : isPersonalSection ? "space-y-4" : "space-y-4"}>
                    {sectionFields.map((field) => renderField(field))}
                </div>
            </div>
        );
    };

    // View mode - show normal card
    if (!isEditing) {
        return (
            <LeftColumnCard
                name={displayName}
                status={status}
                avatar={displayAvatar}
                fields={fields}
                accentColor={displayColor}
                isEditable={true}
                isAddable={isAddable}
                onEdit={() => setIsEditing(true)}
                onAdd={onAdd}
            />
        );
    }

    // Edit mode - show form inline
    return (
        <div className="w-full">
            <Card accentColor={displayColor} className="w-full">
                {!showDeleteConfirm ? (
                    <form onSubmit={methods.handleSubmit(handleSubmit)}>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/50">
                            <div className="flex items-center gap-6 flex-1">
                                {displayAvatar}
                                <div className="flex-1">
                                    <h3 className="text-3xl font-bold text-foreground">{displayName}</h3>
                                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Update Form</div>
                                </div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="py-6 space-y-8">
                            {Object.entries(groupedFields).map(([section, sectionFields]) => renderSection(section, sectionFields))}
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-5 border-t border-border/50">
                            <SubmitDeleteCancelReset
                                onSubmit={() => {}}
                                onCancel={() => {
                                    setIsEditing(false);
                                    methods.reset(defaultValues);
                                }}
                                onReset={() => methods.reset(defaultValues)}
                                onDelete={onDelete ? () => setShowDeleteConfirm(true) : undefined}
                                isSubmitting={isSubmitting}
                                canDelete={canDelete}
                                hasChanges={hasChanges}
                                color={displayColor}
                                deleteDisabledReason={deleteMessage}
                            />
                        </div>
                    </form>
                ) : (
                    <div className="py-12 space-y-8">
                        <div className="text-center space-y-3">
                            <p className="text-lg font-medium text-foreground">{deleteMessage}</p>
                            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className={`
                                    px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border
                                    ${
                                        isDeleting
                                            ? "bg-muted/30 text-muted-foreground/40 border-transparent cursor-not-allowed opacity-50"
                                            : "bg-background text-foreground border-border hover:bg-muted/50 active:scale-95 cursor-pointer"
                                    }
                                `}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className={`
                                    px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border
                                    ${
                                        isDeleting
                                            ? "bg-muted/50 text-muted-foreground/50 border-transparent cursor-not-allowed opacity-50"
                                            : "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20 active:scale-95 cursor-pointer"
                                    }
                                `}
                            >
                                {isDeleting ? "Deleting..." : "Confirm Delete"}
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
