"use client";

import { useCallback, useMemo, memo, useState } from "react";
import { z } from "zod";
import { ENTITY_DATA } from "@/config/entities";
import { FormField, FormInput } from "@/src/components/ui/form";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { MasterSchoolForm, useMasterForm } from "./MasterSchoolForm";
import { equipmentCreateSchema, defaultEquipmentForm, type EquipmentCreateForm } from "@/src/validation/equipment";
import FormMultiSelect from "@/src/components/ui/form/form-multi-select";
import FormIconSelect from "@/src/components/ui/form/form-icon-select";

// Re-export for backward compatibility
export { equipmentCreateSchema as equipmentFormSchema, type EquipmentCreateForm as EquipmentFormData };

interface Equipment4SchoolFormProps {
    formData: EquipmentCreateForm;
    onFormDataChange: (data: EquipmentCreateForm) => void;
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
    onCategoryChange: (value: any) => void;
    error?: string;
    isValid?: boolean;
    onFieldTouch: () => void;
}) {
    const handleChange = useCallback(
        (value: string) => {
            onFieldTouch();
            onCategoryChange(value);
        },
        [onFieldTouch, onCategoryChange],
    );

    return (
        <FormField label="Category" required error={error} isValid={isValid}>
            <FormIconSelect
                options={EQUIPMENT_CATEGORIES}
                value={category}
                onChange={handleChange}
            />
        </FormField>
    );
});

// Sub-component: Brand and Model Fields
const BrandModelFieldsMemo = memo(function BrandModelFields({
    brand,
    model,
    onBrandChange,
    onModelChange,
    brandError,
    modelError,
    brandIsValid,
    modelIsValid,
    onFieldTouch,
}: {
    brand: string;
    model: string;
    onBrandChange: (value: string) => void;
    onModelChange: (value: string) => void;
    brandError?: string;
    modelError?: string;
    brandIsValid?: boolean;
    modelIsValid?: boolean;
    onFieldTouch: (field: "brand" | "model") => void;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Brand" required error={brandError} isValid={brandIsValid}>
                <FormInput
                    type="text"
                    value={brand || ""}
                    onChange={(e) => {
                        onFieldTouch("brand");
                        onBrandChange(e.target.value);
                    }}
                    placeholder="e.g., North, Duotone"
                    error={!!brandError}
                />
            </FormField>
            <FormField label="Model" required error={modelError} isValid={modelIsValid}>
                <FormInput
                    type="text"
                    value={model || ""}
                    onChange={(e) => {
                        onFieldTouch("model");
                        onModelChange(e.target.value);
                    }}
                    placeholder="Enter model"
                    error={!!modelError}
                />
            </FormField>
        </div>
    );
});

// Sub-component: Size and Color Fields
const SizeColorFieldsMemo = memo(function SizeColorFields({
    size,
    color,
    onSizeChange,
    onColorChange,
    onFieldTouch,
}: {
    size: number | undefined;
    color: string | undefined;
    onSizeChange: (value: number | undefined) => void;
    onColorChange: (value: string) => void;
    onFieldTouch: (field: "size" | "color") => void;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Size (m²)">
                <FormInput
                    type="number"
                    value={size ?? ""}
                    onChange={(e) => {
                        onFieldTouch("size");
                        onSizeChange(e.target.value ? parseFloat(e.target.value) : undefined);
                    }}
                    placeholder="e.g., 14, 17, 19"
                    step="0.1"
                />
            </FormField>
            <FormField label="Color">
                <FormInput
                    type="text"
                    value={color || ""}
                    onChange={(e) => {
                        onFieldTouch("color");
                        onColorChange(e.target.value);
                    }}
                    placeholder="e.g., Blue, Red, Black"
                />
            </FormField>
        </div>
    );
});

// Sub-component: SKU Field
const SkuFieldMemo = memo(function SkuField({
    sku,
    onSkuChange,
    skuError,
    skuIsValid,
    onFieldTouch,
}: {
    sku: string;
    onSkuChange: (value: string) => void;
    skuError?: string;
    skuIsValid?: boolean;
    onFieldTouch: () => void;
}) {
    return (
        <FormField label="SKU / Serial Number" required error={skuError} isValid={skuIsValid}>
            <FormInput
                type="text"
                value={sku || ""}
                onChange={(e) => {
                    onFieldTouch();
                    onSkuChange(e.target.value);
                }}
                placeholder="Enter SKU"
                error={!!skuError}
            />
        </FormField>
    );
});

// Sub-component: Status Field
const StatusFieldMemo = memo(function StatusField({
    status,
    onStatusChange,
}: {
    status: string | undefined;
    onStatusChange: (value: any) => void;
}) {
    const statusOptions = ["rental", "public", "selling", "sold", "inrepair", "rip"];
    return (
        <FormField label="Status">
            <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Default: public</p>
                <FormMultiSelect
                    options={statusOptions.map((opt) => ({
                        value: opt,
                        label: opt.charAt(0).toUpperCase() + opt.slice(1),
                    }))}
                    value={status}
                    onChange={(val) => onStatusChange(val)}
                    multi={false}
                    allowCustom={false}
                />
            </div>
        </FormField>
    );
});

// Main component - ONLY RENDERS
export default function Equipment4SchoolForm({
    formData,
    onFormDataChange,
    isFormReady = false,
    showSubmit = true,
    onSubmit,
    isLoading = false,
    onClose,
}: Equipment4SchoolFormProps) {
    const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment");

    // Memoize entity title to prevent re-renders on keystroke
    const entityTitle = useMemo(() => {
        const cat = EQUIPMENT_CATEGORIES.find((c) => c.id === formData.category);
        const catName = cat?.name || "Equipment";
        const details = [formData.brand, formData.model, formData.size].filter(Boolean).join(" ");
        return details ? `${catName} - ${details}` : `New ${catName}`;
    }, [formData.category, formData.brand, formData.model, formData.size]);

    // Track which fields have been touched/interacted with
    const [touchedFields, setTouchedFields] = useState<Set<keyof EquipmentCreateForm>>(new Set());
    
    // Get hasSubmitted from MasterSchoolForm context
    const { hasSubmitted } = useMasterForm();

    const handleClear = useCallback(() => {
        setTouchedFields(new Set());
        onFormDataChange(defaultEquipmentForm);
    }, [onFormDataChange]);

    const handleFieldTouch = useCallback((field: keyof EquipmentCreateForm) => {
        setTouchedFields((prev) => new Set(prev).add(field));
    }, []);

    const updateField = useCallback(
        (field: keyof EquipmentCreateForm, value: any) => {
            handleFieldTouch(field);
            onFormDataChange((prevData: EquipmentCreateForm) => {
                return { ...prevData, [field]: value };
            });
        },
        [onFormDataChange, handleFieldTouch],
    );

    const getFieldError = (field: keyof EquipmentCreateForm): string | undefined => {
        // Only show error if field has been touched or form has been submitted
        if (!touchedFields.has(field) && !hasSubmitted) {
            return undefined;
        }
        
        try {
            equipmentCreateSchema.shape[field].parse(formData[field]);
            return undefined;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return error.issues[0]?.message;
            }
            return undefined;
        }
    };

    const isFieldValid = (field: keyof EquipmentCreateForm): boolean => {
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
                onFieldTouch={() => handleFieldTouch("category")}
            />

            {/* Brand and Model */}
            <BrandModelFieldsMemo
                brand={formData.brand}
                model={formData.model}
                onBrandChange={(value) => updateField("brand", value)}
                onModelChange={(value) => updateField("model", value)}
                brandError={getFieldError("brand")}
                modelError={getFieldError("model")}
                brandIsValid={isFieldValid("brand")}
                modelIsValid={isFieldValid("model")}
                onFieldTouch={(field) => handleFieldTouch(field)}
            />

            {/* Size and Color */}
            <SizeColorFieldsMemo
                size={formData.size}
                color={formData.color}
                onSizeChange={(value) => updateField("size", value)}
                onColorChange={(value) => updateField("color", value)}
                onFieldTouch={(field) => handleFieldTouch(field)}
            />

            {/* SKU */}
            <SkuFieldMemo
                sku={formData.sku}
                onSkuChange={(value) => updateField("sku", value)}
                skuError={getFieldError("sku")}
                skuIsValid={isFieldValid("sku")}
                onFieldTouch={() => handleFieldTouch("sku")}
            />

            {/* Status */}
            <StatusFieldMemo status={formData.status} onStatusChange={(value) => updateField("status", value)} />
        </>
    );

        return (

            <MasterSchoolForm

                icon={equipmentEntity?.icon}

                color={equipmentEntity?.color}

                                        entityTitle={entityTitle}

                                        isFormReady={isFormReady}

                                        onSubmit={onSubmit || (() => Promise.resolve())}

                                        onCancel={onClose || (() => { /* no-op */ })}

                                        onClear={handleClear}

                isLoading={isLoading}

                showSubmit={showSubmit}

                submitLabel="Add Equipment"

            >

                {formContent}

            </MasterSchoolForm>

        );

    }

    