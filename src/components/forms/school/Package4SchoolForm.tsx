"use client";

import { useMemo, useCallback, memo, useState } from "react";
import { z } from "zod";
import { Receipt } from "lucide-react";
import { FormField, FormInput } from "@/src/components/ui/form";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { ENTITY_DATA } from "@/config/entities";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import { MasterSchoolForm, useMasterForm } from "./MasterSchoolForm";
import { schoolPackageCreateSchema, defaultPackageForm, type SchoolPackageCreateForm } from "@/src/validation/school-package";
import FormMultiSelect from "@/src/components/ui/form/form-multi-select";
import FormTextarea from "@/src/components/ui/form/form-textarea";
import FormIconSelect from "@/src/components/ui/form/form-icon-select";

// Re-export for backward compatibility
export { schoolPackageCreateSchema as packageFormSchema, type SchoolPackageCreateForm as PackageFormData };

interface Package4SchoolFormProps {
    formData: SchoolPackageCreateForm;
    onFormDataChange: (data: SchoolPackageCreateForm) => void;
    isFormReady?: boolean;
    showSubmit?: boolean;
    onSubmit?: () => void;
    isLoading?: boolean;
    onClose?: () => void;
}

// Sub-component: Description Field
const DescriptionFieldMemo = memo(function DescriptionField({
    formData,
    onFormDataChange,
    error,
    isValid,
    onFieldTouch,
}: {
    formData: SchoolPackageCreateForm;
    onFormDataChange: (data: SchoolPackageCreateForm) => void;
    error?: string;
    isValid?: boolean;
    onFieldTouch: (field: keyof SchoolPackageCreateForm) => void;
}) {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onFieldTouch("description");
            onFormDataChange({ ...formData, description: e.target.value });
        },
        [formData, onFormDataChange, onFieldTouch],
    );

    return (
        <FormField label="Description" required error={error} isValid={isValid}>
            <FormTextarea
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Beginner Discovery Pack / Zero to Hero / Advance Riding"
            />
        </FormField>
    );
});

// Sub-component: Category Equipment Selection
const CategoryEquipmentFieldMemo = memo(function CategoryEquipmentField({
    formData,
    onFormDataChange,
    error,
    isValid,
    onFieldTouch,
}: {
    formData: SchoolPackageCreateForm;
    onFormDataChange: (data: SchoolPackageCreateForm) => void;
    error?: string;
    isValid?: boolean;
    onFieldTouch: (field: keyof SchoolPackageCreateForm) => void;
}) {
    const handleChange = useCallback(
        (value: string) => {
            onFieldTouch("category_equipment");
            onFormDataChange({ ...formData, category_equipment: value });
        },
        [formData, onFormDataChange, onFieldTouch],
    );

    return (
        <FormField label="Equipment Category" required error={error} isValid={isValid}>
            <FormIconSelect options={EQUIPMENT_CATEGORIES} value={formData.category_equipment} onChange={handleChange} />
        </FormField>
    );
});

// Sub-component: Equipment Capacity Field
const CapacityEquipmentFieldMemo = memo(function CapacityEquipmentField({
    formData,
    onFormDataChange,
    error,
    isValid,
    onFieldTouch,
}: {
    formData: SchoolPackageCreateForm;
    onFormDataChange: (data: SchoolPackageCreateForm) => void;
    error?: string;
    isValid?: boolean;
    onFieldTouch: (field: keyof SchoolPackageCreateForm) => void;
}) {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onFieldTouch("capacity_equipment");
            const value = parseInt(e.target.value) || 0;
            onFormDataChange({ ...formData, capacity_equipment: value });
        },
        [formData, onFormDataChange, onFieldTouch],
    );

    return (
        <FormField label="Equipment Units" required error={error} isValid={isValid}>
            <FormInput type="number" value={formData.capacity_equipment || ""} onChange={handleChange} placeholder="Max eq." min={1} />
        </FormField>
    );
});

// Sub-component: Duration Field
const DurationFieldMemo = memo(function DurationField({
    formData,
    onFormDataChange,
    error,
    isValid,
    onFieldTouch,
}: {
    formData: SchoolPackageCreateForm;
    onFormDataChange: (data: SchoolPackageCreateForm) => void;
    error?: string;
    isValid?: boolean;
    onFieldTouch: (field: keyof SchoolPackageCreateForm) => void;
}) {
    const hours = useMemo(() => Math.floor(formData.duration_minutes / 60), [formData.duration_minutes]);
    const minutes = useMemo(() => formData.duration_minutes % 60, [formData.duration_minutes]);

    const handleHoursChange = useCallback(
        (newHours: number) => {
            onFieldTouch("duration_minutes");
            const totalMinutes = Math.max(0, newHours) * 60 + minutes;
            onFormDataChange({ ...formData, duration_minutes: totalMinutes });
        },
        [formData, onFormDataChange, minutes, onFieldTouch],
    );

    const handleMinutesChange = useCallback(
        (newMinutes: number) => {
            onFieldTouch("duration_minutes");
            const clampedMinutes = Math.max(0, Math.min(59, newMinutes));
            const totalMinutes = hours * 60 + clampedMinutes;
            onFormDataChange({ ...formData, duration_minutes: totalMinutes });
        },
        [formData, onFormDataChange, hours, onFieldTouch],
    );

    return (
        <FormField label="Duration" required error={error} isValid={isValid}>
            <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-muted-foreground">
                        h
                    </span>
                    <FormInput
                        type="number"
                        value={hours || ""}
                        onChange={(e) => handleHoursChange(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min={0}
                        className="pr-8"
                    />
                </div>
                <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-muted-foreground">
                        m
                    </span>
                    <FormInput
                        type="number"
                        value={minutes || ""}
                        onChange={(e) => handleMinutesChange(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min={0}
                        max={59}
                        className="pr-8"
                    />
                </div>
            </div>
        </FormField>
    );
});

// Sub-component: Pricing & Revenue Field
const PricingRevenueFieldMemo = memo(function PricingRevenueField({
    formData,
    onFormDataChange,
    priceError,
    capacityError,
    priceIsValid,
    capacityIsValid,
    onFieldTouch,
}: {
    formData: SchoolPackageCreateForm;
    onFormDataChange: (data: SchoolPackageCreateForm) => void;
    priceError?: string;
    capacityError?: string;
    priceIsValid?: boolean;
    capacityIsValid?: boolean;
    onFieldTouch: (field: keyof SchoolPackageCreateForm) => void;
}) {
    const handlePriceChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onFieldTouch("price_per_student");
            const value = parseInt(e.target.value) || 0;
            onFormDataChange({ ...formData, price_per_student: value });
        },
        [formData, onFormDataChange, onFieldTouch],
    );

    const handleCapacityChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onFieldTouch("capacity_students");
            const value = parseInt(e.target.value) || 0;
            onFormDataChange({ ...formData, capacity_students: value });
        },
        [formData, onFormDataChange, onFieldTouch],
    );

    const revenue = useMemo(
        () => formData.price_per_student * formData.capacity_students,
        [formData.price_per_student, formData.capacity_students],
    );

    return (
        <div className="grid grid-cols-3 gap-4">
            <FormField label="Price / Student" required error={priceError} isValid={priceIsValid}>
                <FormInput
                    type="number"
                    value={formData.price_per_student || ""}
                    onChange={handlePriceChange}
                    placeholder="0"
                    min={0}
                />
            </FormField>

            <FormField label="Capacity / Student" required error={capacityError} isValid={capacityIsValid}>
                <FormInput
                    type="number"
                    value={formData.capacity_students || ""}
                    onChange={handleCapacityChange}
                    placeholder="Max students"
                    min={1}
                />
            </FormField>

            <FormField
                label={
                    <div className="flex items-center gap-1.5">
                        <span>Revenue</span>
                        <Receipt size={14} className="text-secondary" />
                    </div>
                }
            >
                <FormInput
                    type="text"
                    value={revenue > 0 ? revenue.toFixed(0) : ""}
                    placeholder="0"
                    disabled
                    className="bg-muted/50 cursor-not-allowed font-medium text-foreground"
                />
            </FormField>
        </div>
    );
});

// Sub-component: Visibility Field
const VisibilityFieldMemo = memo(function VisibilityField({
    formData,
    onFormDataChange,
}: {
    formData: SchoolPackageCreateForm;
    onFormDataChange: (data: SchoolPackageCreateForm) => void;
}) {
    const handleVisibilityToggle = useCallback(() => {
        onFormDataChange({ ...formData, is_public: !formData.is_public });
    }, [formData, onFormDataChange]);

    return (
        <FormField label="Public Visibility">
            <div className="flex items-center h-10">
                <ToggleSwitch
                    value={formData.is_public ? "public" : "private"}
                    onChange={handleVisibilityToggle}
                    values={{ left: "public", right: "private" }}
                    counts={{ public: 0, private: 0 }}
                    showLabels={true}
                />
            </div>
        </FormField>
    );
});

// Main component - ONLY RENDERS
export default function Package4SchoolForm({
    formData,
    onFormDataChange,
    isFormReady = false,
    showSubmit = true,
    onSubmit,
    isLoading = false,
    onClose,
}: Package4SchoolFormProps) {
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage");

    const [touchedFields, setTouchedFields] = useState<Set<keyof SchoolPackageCreateForm>>(new Set());
    
    // Get hasSubmitted from MasterSchoolForm context
    const { hasSubmitted } = useMasterForm();

    const entityTitle = useMemo(() => {
        return formData.description || "New Package";
    }, [formData.description]);

    const handleClear = useCallback(() => {
        setTouchedFields(new Set());
        onFormDataChange(defaultPackageForm);
    }, [onFormDataChange]);

    const handleFieldTouch = useCallback((field: keyof SchoolPackageCreateForm) => {
        setTouchedFields((prev) => new Set(prev).add(field));
    }, []);

    const handleTypeChange = useCallback(
        (value: string) => {
            handleFieldTouch("package_type");
            onFormDataChange({ ...formData, package_type: value as "rental" | "lessons" });
        },
        [formData, onFormDataChange, handleFieldTouch],
    );

    const getFieldError = useCallback(
        (field: keyof SchoolPackageCreateForm): string | undefined => {
            if (!touchedFields.has(field) && !hasSubmitted) return undefined;
            try {
                schoolPackageCreateSchema.shape[field].parse(formData[field]);
                return undefined;
            } catch (error) {
                if (error instanceof z.ZodError) return error.issues[0]?.message;
                return undefined;
            }
        },
        [formData, touchedFields, hasSubmitted],
    );

    const isFieldValid = useCallback(
        (field: keyof SchoolPackageCreateForm): boolean => {
            return getFieldError(field) === undefined && !!formData[field];
        },
        [getFieldError, formData],
    );

    const formContent = (
        <>
            <DescriptionFieldMemo
                formData={formData}
                onFormDataChange={onFormDataChange}
                error={getFieldError("description")}
                isValid={isFieldValid("description")}
                onFieldTouch={handleFieldTouch}
            />

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <CategoryEquipmentFieldMemo
                        formData={formData}
                        onFormDataChange={onFormDataChange}
                        error={getFieldError("category_equipment")}
                        isValid={isFieldValid("category_equipment")}
                        onFieldTouch={handleFieldTouch}
                    />
                </div>
                <div className="flex flex-col justify-between pt-1">
                    <CapacityEquipmentFieldMemo
                        formData={formData}
                        onFormDataChange={onFormDataChange}
                        error={getFieldError("capacity_equipment")}
                        isValid={isFieldValid("capacity_equipment")}
                        onFieldTouch={handleFieldTouch}
                    />
                    <div className="pt-2">
                        <FormMultiSelect
                            options={[
                                { value: "lessons", label: "Lessons" },
                                { value: "rental", label: "Rental" },
                            ]}
                            value={formData.package_type}
                            onChange={handleTypeChange}
                            multi={false}
                            allowCustom={false}
                        />
                    </div>
                </div>
            </div>

            <DurationFieldMemo
                formData={formData}
                onFormDataChange={onFormDataChange}
                error={getFieldError("duration_minutes")}
                isValid={isFieldValid("duration_minutes")}
                onFieldTouch={handleFieldTouch}
            />

            <PricingRevenueFieldMemo
                formData={formData}
                onFormDataChange={onFormDataChange}
                priceError={getFieldError("price_per_student")}
                capacityError={getFieldError("capacity_students")}
                priceIsValid={isFieldValid("price_per_student")}
                capacityIsValid={isFieldValid("capacity_students")}
                onFieldTouch={handleFieldTouch}
            />

            <VisibilityFieldMemo formData={formData} onFormDataChange={onFormDataChange} />
        </>
    );

    return (
        <MasterSchoolForm
            icon={packageEntity?.icon}
            color={packageEntity?.color}
            entityTitle={entityTitle}
            isFormReady={isFormReady}
            onSubmit={onSubmit || (() => Promise.resolve())}
            onCancel={onClose || (() => { /* no-op */ })}
            onClear={handleClear}
        >
            {formContent}
        </MasterSchoolForm>
    );
}
