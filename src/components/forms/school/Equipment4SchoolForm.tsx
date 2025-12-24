"use client";

import { useCallback, useMemo, memo } from "react";
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
}: {
    category: string;
    onCategoryChange: (value: string) => void;
    error?: string;
    isValid?: boolean;
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
                            onClick={() => onCategoryChange(cat.id)}
                            className={`p-4 border-2 rounded-lg transition-all flex flex-col items-center gap-2 ${category === cat.id
                                ? `${FORM_SUMMARY_COLORS.required.bg} border-green-300 dark:border-green-700`
                                : "border-border bg-background hover:border-green-300/50"
                                }`}
                        >
                            <div className="w-12 h-12 flex items-center justify-center" style={{ color: category === cat.id ? cat.color : "#94a3b8" }}>
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

// Sub-component: SKU and Model Fields
const SkuModelFieldsMemo = memo(function SkuModelFields({
    sku,
    model,
    onSkuChange,
    onModelChange,
    skuError,
    modelError,
    skuIsValid,
    modelIsValid,
}: {
    sku: string;
    model: string;
    onSkuChange: (value: string) => void;
    onModelChange: (value: string) => void;
    skuError?: string;
    modelError?: string;
    skuIsValid?: boolean;
    modelIsValid?: boolean;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="SKU" required error={skuError} isValid={skuIsValid}>
                <FormInput
                    type="text"
                    value={sku}
                    onChange={(e) => onSkuChange(e.target.value)}
                    placeholder="Enter SKU"
                    error={!!skuError}
                />
            </FormField>
            <FormField label="Model" required error={modelError} isValid={modelIsValid}>
                <FormInput
                    type="text"
                    value={model}
                    onChange={(e) => onModelChange(e.target.value)}
                    placeholder="Enter model"
                    error={!!modelError}
                />
            </FormField>
        </div>
    );
});

// Sub-component: Color and Size Fields
const ColorSizeFieldsMemo = memo(function ColorSizeFields({
    color,
    size,
    onColorChange,
    onSizeChange,
}: {
    color: string | undefined;
    size: number | undefined;
    onColorChange: (value: string) => void;
    onSizeChange: (value: number | undefined) => void;
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
                            className={`px-4 py-2 text-sm font-medium rounded-md border-2 transition-all ${status === opt
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
        return formData.sku ? `${catName} - ${formData.sku}` : `New ${catName}`;
    }, [formData.category, formData.sku]);

    const handleClear = useCallback(() => {
        onFormDataChange(defaultEquipmentForm);
    }, [onFormDataChange]);

    const updateField = useCallback((field: keyof EquipmentFormData, value: any) => {
        onFormDataChange((prevData: EquipmentFormData) => {
            return { ...prevData, [field]: value };
        });
    }, [onFormDataChange]);

    const getFieldError = (field: keyof EquipmentFormData): string | undefined => {
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

    const formContent = (
        <>
            {/* Category */}
            <CategoryFieldMemo
                category={formData.category}
                onCategoryChange={(value) => updateField("category", value)}
                error={getFieldError("category")}
                isValid={isFieldValid("category")}
            />

            {/* SKU and Model */}
            <SkuModelFieldsMemo
                sku={formData.sku}
                model={formData.model}
                onSkuChange={(value) => updateField("sku", value)}
                onModelChange={(value) => updateField("model", value)}
                skuError={getFieldError("sku")}
                modelError={getFieldError("model")}
                skuIsValid={isFieldValid("sku")}
                modelIsValid={isFieldValid("model")}
            />

            {/* Color and Size */}
            <ColorSizeFieldsMemo
                color={formData.color}
                size={formData.size}
                onColorChange={(value) => updateField("color", value)}
                onSizeChange={(value) => updateField("size", value)}
            />

            {/* Status */}
            <StatusFieldMemo
                status={formData.status}
                onStatusChange={(value) => updateField("status", value)}
            />

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
            onSubmit={onSubmit || (() => Promise.resolve())}
            onCancel={onClose || (() => {})}
            onClear={handleClear}
            isLoading={isLoading}
            submitLabel="Add Equipment"
        >
            {formContent}
        </MasterSchoolForm>
    );
}
