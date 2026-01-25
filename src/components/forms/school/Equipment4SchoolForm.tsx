"use client";

import { useCallback, useMemo, memo, useState } from "react";
import { z } from "zod";
import { ENTITY_DATA } from "@/config/entities";
import { FormField, FormInput } from "@/src/components/ui/form";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { FORM_SUMMARY_COLORS } from "@/types/form-summary";
import { MasterSchoolForm } from "./MasterSchoolForm";
import { equipmentFormSchema, defaultEquipmentForm, type EquipmentFormData } from "@/types/form-entities";

// Re-export for backward compatibility
export { equipmentFormSchema, type EquipmentFormData };

interface Equipment4SchoolFormProps {
    formData: EquipmentFormData;
    onFormDataChange: (data: EquipmentFormData) => void;
    isFormReady?: boolean;
    showSubmit?: boolean;
    onSubmit?: () => void;
    isLoading?: boolean;
    onClose?: () => void;
}

// Sub-component: Category Selection
const CategoryFieldMemo = memo(function CategoryField({
    category,
    onCategoryChange,
    error,
    isValid,
    onFieldTouch,
}: {
    category: string;
    onCategoryChange: (value: string) => void;
    error?: string;
    isValid?: boolean;
    onFieldTouch: () => void;
}) {
    return (
        <FormField label="Category" required error={error} isValid={isValid}>
            <div className="grid grid-cols-3 gap-4">
                {EQUIPMENT_CATEGORIES.map((cat) => {
                    const CategoryIcon = cat.icon;
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                                onFieldTouch();
                                onCategoryChange(cat.id);
                            }}
                            className={`p-4 border-2 rounded-lg transition-all flex flex-col items-center gap-2 ${
                                category === cat.id
                                    ? `${FORM_SUMMARY_COLORS.required.bg} border-green-300 dark:border-green-700`
                                    : "border-border bg-background hover:border-green-300/50"
                            }`}
                        >
                            <div
                                className="w-12 h-12 flex items-center justify-center"
                                style={{ color: category === cat.id ? cat.color : "#94a3b8" }}
                            >
                                <CategoryIcon className="w-12 h-12" />
                            </div>
                            <div className="font-medium text-sm">{cat.name}</div>
                        </button>
                    );
                })}
            </div>
        </FormField>
    );
});

// Sub-component: Model and Size Fields
const ModelSizeFieldsMemo = memo(function ModelSizeFields({
    model,
    size,
    onModelChange,
    onSizeChange,
    modelError,
    modelIsValid,
    onFieldTouch,
}: {
    model: string;
    size: number | undefined;
    onModelChange: (value: string) => void;
    onSizeChange: (value: number | undefined) => void;
    modelError?: string;
    modelIsValid?: boolean;
    onFieldTouch: () => void;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Model" required error={modelError} isValid={modelIsValid}>
                <FormInput
                    type="text"
                    value={model}
                    onChange={(e) => {
                        onFieldTouch();
                        onModelChange(e.target.value);
                    }}
                    placeholder="Enter model"
                    error={!!modelError}
                />
            </FormField>
            <FormField label="Size">
                <FormInput
                    type="number"
                    value={size ?? ""}
                    onChange={(e) => onSizeChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g., 14, 17, 19"
                />
            </FormField>
        </div>
    );
});

// Sub-component: Color and SKU Fields
const ColorSkuFieldsMemo = memo(function ColorSkuFields({
    color,
    sku,
    onColorChange,
    onSkuChange,
    skuError,
    skuIsValid,
    onFieldTouch,
}: {
    color: string | undefined;
    sku: string;
    onColorChange: (value: string) => void;
    onSkuChange: (value: string) => void;
    skuError?: string;
    skuIsValid?: boolean;
    onFieldTouch: () => void;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Color">
                <FormInput
                    type="text"
                    value={color || ""}
                    onChange={(e) => onColorChange(e.target.value)}
                    placeholder="e.g., Blue, Red, Black"
                />
            </FormField>
            <FormField label="SKU" required error={skuError} isValid={skuIsValid}>
                <FormInput
                    type="text"
                    value={sku}
                    onChange={(e) => {
                        onFieldTouch();
                        onSkuChange(e.target.value);
                    }}
                    placeholder="Enter SKU"
                    error={!!skuError}
                />
            </FormField>
        </div>
    );
});

// Sub-component: Status Field
const StatusFieldMemo = memo(function StatusField({
    status,
    onStatusChange,
}: {
    status: string | undefined;
    onStatusChange: (value: string | undefined) => void;
}) {
    const statusOptions = ["rental", "public", "selling", "sold", "inrepair", "rip"] as const;
    return (
        <FormField label="Status">
            <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Default: public</p>
                <div className="flex flex-wrap gap-2">
                    {statusOptions.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => onStatusChange(opt)}
                            className={`px-4 py-2 text-sm font-medium rounded-md border-2 transition-all ${
                                status === opt
                                    ? `${FORM_SUMMARY_COLORS.required.bg} border-green-300 dark:border-green-700 text-foreground`
                                    : "bg-background text-foreground border-input hover:border-green-300/50"
                            }`}
                        >
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
        </FormField>
    );
});

// Main component - ONLY RENDERS
export default function Equipment4SchoolForm({
    formData,
    onFormDataChange,
    isFormReady = false,
    showSubmit = false,
    onSubmit,
    isLoading = false,
    onClose,
}: Equipment4SchoolFormProps) {
    const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment");

    // Memoize entity title to prevent re-renders on keystroke
    const entityTitle = useMemo(() => {
        const cat = EQUIPMENT_CATEGORIES.find((c) => c.id === formData.category);
        const catName = cat?.name || "Equipment";
        const details = [formData.model, formData.size].filter(Boolean).join(" ");
        return details ? `${catName} - ${details}` : `New ${catName}`;
    }, [formData.category, formData.model, formData.size]);

    // Track which fields have been touched/interacted with
    const [touchedFields, setTouchedFields] = useState<Set<keyof EquipmentFormData>>(new Set());
    // Track if form has been submitted (attempted)
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const handleClear = useCallback(() => {
        setTouchedFields(new Set());
        setHasSubmitted(false);
        onFormDataChange(defaultEquipmentForm);
    }, [onFormDataChange]);

    const handleFieldTouch = useCallback((field: keyof EquipmentFormData) => {
        setTouchedFields((prev) => new Set(prev).add(field));
    }, []);

    const updateField = useCallback(
        (field: keyof EquipmentFormData, value: any) => {
            handleFieldTouch(field);
            onFormDataChange((prevData: EquipmentFormData) => {
                return { ...prevData, [field]: value };
            });
        },
        [onFormDataChange, handleFieldTouch],
    );

    const getFieldError = (field: keyof EquipmentFormData): string | undefined => {
        // Only show error if field has been touched or form has been submitted
        if (!touchedFields.has(field) && !hasSubmitted) {
            return undefined;
        }
        
        try {
            equipmentFormSchema.shape[field].parse(formData[field]);
            return undefined;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return error.issues[0]?.message;
            }
            return undefined;
        }
    };

    const isFieldValid = (field: keyof EquipmentFormData): boolean => {
        return getFieldError(field) === undefined && !!formData[field];
    };

    const handleSubmit = useCallback(async () => {
        setHasSubmitted(true);
        // Mark all fields as touched when submitting
        const allFields: (keyof EquipmentFormData)[] = [
            "category",
            "model",
            "sku",
        ];
        setTouchedFields(new Set(allFields));
        
        if (onSubmit) {
            await onSubmit();
        }
    }, [onSubmit]);

    const formContent = (
        <>
            {/* Category */}
            <CategoryFieldMemo
                category={formData.category}
                onCategoryChange={(value) => updateField("category", value)}
                error={getFieldError("category")}
                isValid={isFieldValid("category")}
                onFieldTouch={() => handleFieldTouch("category")}
            />

            {/* Model and Size */}
            <ModelSizeFieldsMemo
                model={formData.model}
                size={formData.size}
                onModelChange={(value) => updateField("model", value)}
                onSizeChange={(value) => updateField("size", value)}
                modelError={getFieldError("model")}
                modelIsValid={isFieldValid("model")}
                onFieldTouch={() => handleFieldTouch("model")}
            />

            {/* Color and SKU */}
            <ColorSkuFieldsMemo
                color={formData.color}
                sku={formData.sku}
                onColorChange={(value) => updateField("color", value)}
                onSkuChange={(value) => updateField("sku", value)}
                skuError={getFieldError("sku")}
                skuIsValid={isFieldValid("sku")}
                onFieldTouch={() => handleFieldTouch("sku")}
            />

            {/* Status */}
            <StatusFieldMemo status={formData.status} onStatusChange={(value) => updateField("status", value)} />

            {/* TODO: Equipment-Teacher Relation
             * After equipment is created, we need to:
             * 1. Create a relationship linking this equipment to teachers
             * 2. Define how many units of this equipment are available per teacher
             * 3. Track equipment usage/assignments to teachers
             * This relationship should allow:
             * - Teachers to have multiple equipment items
             * - Equipment to be assigned to multiple teachers
             * - Tracking of equipment availability and assignment history
             */}
        </>
    );

    return (
        <MasterSchoolForm
            icon={equipmentEntity?.icon}
            color={equipmentEntity?.color}
            entityTitle={entityTitle}
            isFormReady={isFormReady}
            onSubmit={handleSubmit}
            onCancel={onClose || (() => {})}
            onClear={handleClear}
            isLoading={isLoading}
            submitLabel="Add Equipment"
        >
            {formContent}
        </MasterSchoolForm>
    );
}
