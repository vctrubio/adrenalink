"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRegisterData, usePackageFormState, useFormSubmission } from "../RegisterContext";
import Package4SchoolForm, { PackageFormData, packageFormSchema } from "@/src/components/forms/Package4SchoolForm";
import { createAndLinkPackage } from "@/actions/register-action";
import toast from "react-hot-toast";

const defaultPackageForm: PackageFormData = {
    durationMinutes: 60,
    description: "",
    pricePerStudent: 0,
    capacityStudents: 1,
    capacityEquipment: 1,
    categoryEquipment: "kite",
    packageType: "lessons",
    isPublic: true,
};

export default function PackagePage() {
    const router = useRouter();
    const { addPackage, addToQueue } = useRegisterData();
    const { form: contextForm, setForm: setContextForm } = usePackageFormState();
    const { setPackageFormValid, setPackageSubmit } = useFormSubmission();
    const [formData, setFormData] = useState<PackageFormData>(contextForm || defaultPackageForm);
    const [loading, setLoading] = useState(false);

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
        setPackageFormValid(isFormValid);
    }, [isFormValid, setPackageFormValid]);

    // Define and memoize submit handler
    const handleSubmit = useCallback(async () => {
        if (!isFormValid) return;

        setLoading(true);

        try {
            const result = await createAndLinkPackage({
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
                setLoading(false);
                return;
            }

            // Optimistic update
            const newPackage = {
                id: result.data.id,
                description: result.data.description,
                durationMinutes: result.data.durationMinutes,
                pricePerStudent: result.data.pricePerStudent,
                capacityStudents: result.data.capacityStudents,
                capacityEquipment: result.data.capacityEquipment,
                categoryEquipment: result.data.categoryEquipment,
                isPublic: result.data.isPublic,
            };
            addPackage(newPackage);

            // Add to queue
            addToQueue("packages", {
                id: result.data.id,
                name: formData.description,
                timestamp: Date.now(),
            });

            toast.success(`Package created: ${formData.description}`);

            // Reset form
            setFormData(defaultPackageForm);
            setContextForm(null);
            setLoading(false);
        } catch (error) {
            console.error("Package creation error:", error);
            console.error("Full error details:", JSON.stringify(error, null, 2));
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            console.error("Showing toast with message:", errorMessage);
            toast.error(errorMessage || "An unexpected error occurred");
            setLoading(false);
        }
    }, [isFormValid, formData, addPackage, addToQueue, setContextForm]);

    // Register submit handler in context
    useEffect(() => {
        setPackageSubmit(() => handleSubmit);
    }, [handleSubmit, setPackageSubmit]);

    return (
        <div className="bg-card rounded-lg border border-border">
            <div className="p-6">
                <Package4SchoolForm formData={formData} onFormDataChange={setFormData} isFormReady={isFormValid} />
            </div>
        </div>
    );
}

