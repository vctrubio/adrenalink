"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRegisterActions, usePackageFormState, useFormRegistration } from "../RegisterContext";
import Package4SchoolForm, { PackageFormData, packageFormSchema } from "@/src/components/forms/school/Package4SchoolForm";
import { createSchoolPackage } from "@/supabase/server/register";
import toast from "react-hot-toast";

const defaultPackageForm: PackageFormData = {
    durationMinutes: 60,
    description: "",
    pricePerStudent: 0,
    capacityStudents: 1,
    capacityEquipment: 1,
    categoryEquipment: "" as any,
    packageType: "" as any,
    isPublic: true,
};

export default function PackagePage() {
    const router = useRouter();
    const { addToQueue } = useRegisterActions();
    const { form: contextForm, setForm: setContextForm } = usePackageFormState();
    const { registerSubmitHandler, setFormValidity } = useFormRegistration();
    const [formData, setFormData] = useState<PackageFormData>(contextForm || defaultPackageForm);

    // Update context when form data changes
    useEffect(() => {
        setContextForm(formData);
    }, [formData, setContextForm]);

    const isFormValid = useMemo(() => {
        const result = packageFormSchema.safeParse(formData);
        return result.success;
    }, [formData]);

    // Update form validity in context
    useEffect(() => {
        setFormValidity(isFormValid);
    }, [isFormValid, setFormValidity]);

    // Define and memoize submit handler
    const handleSubmit = useCallback(async () => {
        if (!isFormValid) return;

        try {
            const result = await createSchoolPackage({
                durationMinutes: formData.durationMinutes,
                description: formData.description || null,
                pricePerStudent: formData.pricePerStudent,
                capacityStudents: formData.capacityStudents,
                capacityEquipment: formData.capacityEquipment,
                categoryEquipment: formData.categoryEquipment,
                packageType: formData.packageType,
                isPublic: formData.isPublic,
            });

            if (!result.success) {
                toast.error(result.error || "Failed to create package");
                return;
            }

            // Add to queue for quick access in booking form
            addToQueue("packages", {
                id: result.data.id,
                name: formData.description,
                timestamp: Date.now(),
                type: "package",
                metadata: {
                    id: result.data.id,
                    description: result.data.description,
                    durationMinutes: result.data.durationMinutes,
                    pricePerStudent: result.data.pricePerStudent,
                    capacityStudents: result.data.capacityStudents,
                    capacityEquipment: result.data.capacityEquipment,
                    categoryEquipment: result.data.categoryEquipment,
                    isPublic: result.data.isPublic,
                },
            });

            // Reset form
            setFormData({
                durationMinutes: 60,
                description: "",
                pricePerStudent: 0,
                capacityStudents: 1,
                capacityEquipment: 1,
                categoryEquipment: "" as any,
                packageType: "" as any,
                isPublic: true,
            });
        } catch (error) {
            console.error("Package creation error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(errorMessage);
        }
    }, [isFormValid, formData, addToQueue, setContextForm]);

    // Register submit handler in context
    useEffect(() => {
        registerSubmitHandler(handleSubmit);
    }, [handleSubmit, registerSubmitHandler]);

    return (
        <div className="bg-card rounded-lg border border-border">
            <div className="p-6">
                <Package4SchoolForm
                    formData={formData}
                    onFormDataChange={setFormData}
                    isFormReady={isFormValid}
                    onSubmit={handleSubmit}
                    isLoading={false}
                />
            </div>
        </div>
    );
}