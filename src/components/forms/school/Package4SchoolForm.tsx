"use client";

import { useMemo, useCallback, memo, ReactNode } from "react";
import { z } from "zod";
import { FormField, FormInput } from "@/src/components/ui/form";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { FORM_SUMMARY_COLORS } from "@/types/form-summary";
import { ENTITY_DATA } from "@/config/entities";
import ToggleSwitch from "@/src/components/ui/ToggleSwitch";
import { MasterSchoolForm } from "./MasterSchoolForm";
import { packageFormSchema, defaultPackageForm, type PackageFormData } from "@/types/form-entities";

// Re-export for backward compatibility
export { packageFormSchema, type PackageFormData };

interface Package4SchoolFormProps {
    formData: PackageFormData;
    onFormDataChange: (data: PackageFormData) => void;
    isFormReady?: boolean;
    showSubmit?: boolean;
    onSubmit?: () => void;
    isLoading?: boolean;
    onClose?: () => void;
}

// Sub-component: Package Type & Visibility Together
const PackageTypeAndVisibilityFieldMemo = memo(function PackageTypeAndVisibilityField({
    formData,
    onFormDataChange,
    typeError,
    typeIsValid,
}: {
    formData: PackageFormData;
    onFormDataChange: (data: PackageFormData) => void;
    typeError?: string;
    typeIsValid?: boolean;
}) {
    const handleTypeChange = useCallback(
        (value: "rental" | "lessons") => {
            onFormDataChange({ ...formData, packageType: value });
        },
        [formData, onFormDataChange],
    );

    const handleVisibilityToggle = useCallback(() => {
        onFormDataChange({ ...formData, isPublic: !formData.isPublic });
    }, [formData, onFormDataChange]);

    return (
        <div className="space-y-4">
            <FormField label="Package Type" required error={typeError} isValid={typeIsValid}>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => handleTypeChange("lessons")}
                        className={`p-4 border-2 rounded-lg transition-all ${formData.packageType === "lessons" ? `${FORM_SUMMARY_COLORS.required.bg} border-green-300 dark:border-green-700` : "border-border bg-background hover:border-green-300/50"}`}
                    >
                        <div className="font-medium">Lessons</div>
                        <div className="text-sm text-muted-foreground">Teaching sessions</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTypeChange("rental")}
                        className={`p-4 border-2 rounded-lg transition-all ${formData.packageType === "rental" ? `${FORM_SUMMARY_COLORS.required.bg} border-green-300 dark:border-green-700` : "border-border bg-background hover:border-green-300/50"}`}
                    >
                        <div className="font-medium">Rental</div>
                        <div className="text-sm text-muted-foreground">Equipment rental only</div>
                    </button>
                </div>
            </FormField>

            {/* Visibility Toggle */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Visibility</label>
                <ToggleSwitch
                    value={formData.isPublic ? "public" : "private"}
                    onChange={handleVisibilityToggle}
                    values={{ left: "public", right: "private" }}
                    counts={{ public: 0, private: 0 }}
                    tintColor="#3b82f6"
                    showLabels={true}
                />
            </div>
        </div>
    );
});

// Sub-component: Category Equipment Selection
const CategoryEquipmentFieldMemo = memo(function CategoryEquipmentField({
    formData,
    onFormDataChange,
    error,
    isValid,
}: {
    formData: PackageFormData;
    onFormDataChange: (data: PackageFormData) => void;
    error?: string;
    isValid?: boolean;
}) {
    const handleChange = useCallback(
        (value: "kite" | "wing" | "windsurf") => {
            onFormDataChange({ ...formData, categoryEquipment: value });
        },
        [formData, onFormDataChange],
    );

    return (
        <FormField label="Equipment Category" required error={error} isValid={isValid}>
            <div className="grid grid-cols-3 gap-4">
                {EQUIPMENT_CATEGORIES.map((cat) => {
                    const CategoryIcon = cat.icon;
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleChange(cat.id as "kite" | "wing" | "windsurf")}
                            className={`p-4 border-2 rounded-lg transition-all flex flex-col items-center gap-2 ${formData.categoryEquipment === cat.id ? `${FORM_SUMMARY_COLORS.required.bg} border-green-300 dark:border-green-700` : "border-border bg-background hover:border-green-300/50"}`}
                        >
                            <div
                                className="w-12 h-12 flex items-center justify-center"
                                style={{ color: formData.categoryEquipment === cat.id ? cat.color : "#94a3b8" }}
                            >
                                <CategoryIcon className="w-12 h-12" />
                            </div>
                            <div className="font-medium">{cat.name}</div>
                        </button>
                    );
                })}
            </div>
        </FormField>
    );
});

// Sub-component: Duration Field
const DurationFieldMemo = memo(function DurationField({
    formData,
    onFormDataChange,
    error,
    isValid,
}: {
    formData: PackageFormData;
    onFormDataChange: (data: PackageFormData) => void;
    error?: string;
    isValid?: boolean;
}) {
    const hours = useMemo(() => Math.floor(formData.durationMinutes / 60), [formData.durationMinutes]);
    const minutes = useMemo(() => formData.durationMinutes % 60, [formData.durationMinutes]);

    const handleHoursChange = useCallback(
        (newHours: number) => {
            const totalMinutes = Math.max(0, newHours) * 60 + minutes;
            onFormDataChange({ ...formData, durationMinutes: totalMinutes });
        },
        [formData, onFormDataChange, minutes],
    );

    const handleMinutesChange = useCallback(
        (newMinutes: number) => {
            const clampedMinutes = Math.max(0, Math.min(59, newMinutes));
            const totalMinutes = hours * 60 + clampedMinutes;
            onFormDataChange({ ...formData, durationMinutes: totalMinutes });
        },
        [formData, onFormDataChange, hours],
    );

    return (
        <FormField label="Duration" required error={error} isValid={isValid}>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Hours</label>
                    <FormInput
                        type="number"
                        value={hours || ""}
                        onChange={(e) => handleHoursChange(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min={0}
                    />
                </div>
                <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Minutes</label>
                    <FormInput
                        type="number"
                        value={minutes || ""}
                        onChange={(e) => handleMinutesChange(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min={0}
                        max={59}
                    />
                </div>
            </div>
            {/* Display Total */}
            {formData.durationMinutes > 0 && (
                <div className="text-sm text-muted-foreground mt-2">
                    Total:{" "}
                    <span className="font-medium text-foreground">
                        {hours > 0 && `${hours}h `}
                        {minutes > 0 && `${minutes}m`}
                        {hours === 0 && minutes === 0 && "0m"}
                    </span>
                </div>
            )}
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
}: {
    formData: PackageFormData;
    onFormDataChange: (data: PackageFormData) => void;
    priceError?: string;
    capacityError?: string;
    priceIsValid?: boolean;
    capacityIsValid?: boolean;
}) {
    const handlePriceChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseInt(e.target.value) || 0;
            onFormDataChange({ ...formData, pricePerStudent: value });
        },
        [formData, onFormDataChange],
    );

    const handleCapacityChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseInt(e.target.value) || 0;
            onFormDataChange({ ...formData, capacityStudents: value });
        },
        [formData, onFormDataChange],
    );

    const revenue = useMemo(
        () => formData.pricePerStudent * formData.capacityStudents,
        [formData.pricePerStudent, formData.capacityStudents],
    );

    return (
        <div className="grid grid-cols-3 gap-4">
            <FormField label="Price per Student" required error={priceError} isValid={priceIsValid}>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                    <FormInput
                        type="number"
                        value={formData.pricePerStudent || ""}
                        onChange={handlePriceChange}
                        placeholder="0"
                        min={0}
                        className="pl-8"
                    />
                </div>
            </FormField>

            <FormField label="Student Capacity" required error={capacityError} isValid={capacityIsValid}>
                <FormInput
                    type="number"
                    value={formData.capacityStudents || ""}
                    onChange={handleCapacityChange}
                    placeholder="Max students"
                    min={1}
                />
            </FormField>

            <FormField label="Revenue">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                    <FormInput
                        type="text"
                        value={revenue > 0 ? revenue.toFixed(0) : ""}
                        placeholder="0"
                        disabled
                        className="pl-8 bg-muted/50 cursor-not-allowed"
                    />
                </div>
            </FormField>
        </div>
    );
});

// Sub-component: Equipment Capacity Field
const CapacityEquipmentFieldMemo = memo(function CapacityEquipmentField({
    formData,
    onFormDataChange,
    error,
    isValid,
}: {
    formData: PackageFormData;
    onFormDataChange: (data: PackageFormData) => void;
    error?: string;
    isValid?: boolean;
}) {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseInt(e.target.value) || 0;
            onFormDataChange({ ...formData, capacityEquipment: value });
        },
        [formData, onFormDataChange],
    );

    return (
        <FormField label="Equipment Capacity" required error={error} isValid={isValid}>
            <FormInput
                type="number"
                value={formData.capacityEquipment || ""}
                onChange={handleChange}
                placeholder="Max equipment"
                min={1}
            />
        </FormField>
    );
});

// Sub-component: Description Field
const DescriptionFieldMemo = memo(function DescriptionField({
    formData,
    onFormDataChange,
    error,
    isValid,
}: {
    formData: PackageFormData;
    onFormDataChange: (data: PackageFormData) => void;
    error?: string;
    isValid?: boolean;
}) {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onFormDataChange({ ...formData, description: e.target.value });
        },
        [formData, onFormDataChange],
    );

    return (
        <FormField label="Description" required error={error} isValid={isValid}>
            <textarea
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Beginner Discovery Pack / Zero to Hero / Advance Riding"
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px] resize-none"
            />
        </FormField>
    );
});

// Main component - ONLY RENDERS
export default function Package4SchoolForm({
    formData,
    onFormDataChange,
    isFormReady = false,
    showSubmit = false,
    onSubmit,
    isLoading = false,
    onClose,
}: Package4SchoolFormProps) {
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage");

    // Memoize entity title to prevent re-renders on keystroke
    const entityTitle = useMemo(() => {
        return formData.description || "New Package";
    }, [formData.description]);

    const handleClear = useCallback(() => {
        onFormDataChange(defaultPackageForm);
    }, [onFormDataChange]);

    const getFieldError = useCallback(
        (field: keyof PackageFormData): string | undefined => {
            try {
                packageFormSchema.shape[field].parse(formData[field]);
                return undefined;
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return error.issues[0]?.message;
                }
                return undefined;
            }
        },
        [formData],
    );

    const isFieldValid = useCallback(
        (field: keyof PackageFormData): boolean => {
            return getFieldError(field) === undefined && !!formData[field];
        },
        [getFieldError],
    );

    const formContent = (
        <>
            <DescriptionFieldMemo
                formData={formData}
                onFormDataChange={onFormDataChange}
                error={getFieldError("description")}
                isValid={isFieldValid("description")}
            />

            <PackageTypeAndVisibilityFieldMemo
                formData={formData}
                onFormDataChange={onFormDataChange}
                typeError={getFieldError("packageType")}
                typeIsValid={isFieldValid("packageType")}
            />

            <CategoryEquipmentFieldMemo
                formData={formData}
                onFormDataChange={onFormDataChange}
                error={getFieldError("categoryEquipment")}
                isValid={isFieldValid("categoryEquipment")}
            />

            <CapacityEquipmentFieldMemo
                formData={formData}
                onFormDataChange={onFormDataChange}
                error={getFieldError("capacityEquipment")}
                isValid={isFieldValid("capacityEquipment")}
            />

            <DurationFieldMemo
                formData={formData}
                onFormDataChange={onFormDataChange}
                error={getFieldError("durationMinutes")}
                isValid={isFieldValid("durationMinutes")}
            />

            <PricingRevenueFieldMemo
                formData={formData}
                onFormDataChange={onFormDataChange}
                priceError={getFieldError("pricePerStudent")}
                capacityError={getFieldError("capacityStudents")}
                priceIsValid={isFieldValid("pricePerStudent")}
                capacityIsValid={isFieldValid("capacityStudents")}
            />
        </>
    );

    return (
        <MasterSchoolForm
            icon={packageEntity?.icon}
            color={packageEntity?.color}
            entityTitle={entityTitle}
            isFormReady={isFormReady}
            onSubmit={onSubmit || (() => Promise.resolve())}
            onCancel={onClose || (() => {})}
            onClear={handleClear}
            isLoading={isLoading}
            submitLabel="Add Package"
        >
            {formContent}
        </MasterSchoolForm>
    );
}
function PackageRevenueSummary({ formData }: { formData: PackageFormData }) {
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage");
    const packageColor = packageEntity?.color;

    // Calculate values
    const durationHours = formData.durationMinutes / 60;
    const revenue = formData.pricePerStudent * formData.capacityStudents;
    const pricePerHour = durationHours > 0 ? revenue / durationHours : 0;
    const pricePerHourPerStudent = durationHours > 0 ? formData.pricePerStudent / durationHours : 0;

    // Only show if we have meaningful data
    if (!formData.pricePerStudent || !formData.capacityStudents || !formData.durationMinutes) {
        return null;
    }

    return (
        <div className="space-y-3 border-t-2 pt-6" style={{ borderColor: packageColor }}>
            <h3 className="text-lg font-semibold">Revenue Summary</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
                {/* Duration */}
                <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">
                        {Math.floor(durationHours)}h {formData.durationMinutes % 60 > 0 && `${formData.durationMinutes % 60}m`}
                    </p>
                </div>

                {/* Price per Hour */}
                <div>
                    <span className="text-muted-foreground">Revenue per Hour:</span>
                    <p className="font-medium">€{pricePerHour.toFixed(2)}/hr</p>
                </div>

                {/* Only show price per student if capacity > 1 */}
                {formData.capacityStudents > 1 && (
                    <>
                        <div>
                            <span className="text-muted-foreground">Price per Student:</span>
                            <p className="font-medium">€{formData.pricePerStudent}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Price per Hour/Student:</span>
                            <p className="font-medium">€{pricePerHourPerStudent.toFixed(2)}/hr</p>
                        </div>
                    </>
                )}

                {/* Capacity */}
                <div>
                    <span className="text-muted-foreground">Capacity:</span>
                    <p className="font-medium">
                        {formData.capacityEquipment} equipment / {formData.capacityStudents} students
                    </p>
                </div>

                {/* Total Revenue */}
                <div>
                    <span className="text-muted-foreground">Expected Revenue:</span>
                    <p className="font-medium text-green-600">€{revenue.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
}
