"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRegisterActions, usePackageFormState, useFormRegistration } from "../RegisterContext";
import Package4SchoolForm, { PackageFormData, packageFormSchema } from "@/src/components/forms/school/Package4SchoolForm";
import { createSchoolPackage } from "@/supabase/server/register";
import { handleEntityCreation, handlePostCreation } from "@/backend/RegisterSection";
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
        setFormValidity(isFormValid);
    }, [isFormValid, setFormValidity]);

    // Define and memoize submit handler
    const handleSubmit = useCallback(async () => {
        setLoading(true);
        await handleEntityCreation({
            isFormValid,
            entityName: "Package",
            createFn: () =>
                createSchoolPackage({
                    duration_minutes: formData.durationMinutes,
                    description: formData.description || null,
                    price_per_student: formData.pricePerStudent,
                    capacity_students: formData.capacityStudents,
                    capacity_equipment: formData.capacityEquipment,
                    category_equipment: formData.categoryEquipment,
                    package_type: formData.packageType,
                    is_public: formData.isPublic,
                }),
            onSuccess: async (data) => {
                await handlePostCreation({
                    pathname: "/register/package",
                    entityId: data.id,
                    closeDialog: () => {},
                    onSelectId: () => {},
                    onRefresh: async () => {},
                    onAddToQueue: () => {
                        addToQueue("packages", {
                            id: data.id,
                            name: formData.description,
                            timestamp: Date.now(),
                            type: "package",
                            metadata: {
                                id: data.id,
                                description: data.description,
                                durationMinutes: data.duration_minutes,
                                pricePerStudent: data.price_per_student,
                                capacityStudents: data.capacity_students,
                                capacityEquipment: data.capacity_equipment,
                                categoryEquipment: data.category_equipment,
                                packageType: data.package_type,
                                isPublic: data.is_public,
                            },
                        });
                    },
                    setFormData,
                    defaultForm: defaultPackageForm,
                });
            },
            successMessage: `Package created: ${formData.description}`,
        });
        setLoading(false);
    }, [isFormValid, formData, addToQueue]);

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
                    isLoading={loading}
                />
            </div>
        </div>
    );
}