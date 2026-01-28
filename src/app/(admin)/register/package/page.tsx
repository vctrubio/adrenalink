"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRegisterActions, usePackageFormState, useFormRegistration } from "../RegisterContext";
import { SchoolPackageCreateForm, schoolPackageCreateSchema, defaultPackageForm } from "@/src/validation/school-package";
import Package4SchoolForm from "@/src/components/forms/school/Package4SchoolForm";
import { createSchoolPackage } from "@/supabase/server/register";
import toast from "react-hot-toast";

export default function PackagePage() {
    const { addToQueue, handleEntityCreation, handlePostCreation } = useRegisterActions();
    const { form: contextForm, setForm: setContextForm } = usePackageFormState();
    const { registerSubmitHandler, setFormValidity } = useFormRegistration();
    const [formData, setFormData] = useState<SchoolPackageCreateForm>(contextForm || defaultPackageForm);
    const [loading, setLoading] = useState(false);
    const [formKey, setFormKey] = useState(0);

    // Update context when form data changes
    useEffect(() => {
        setContextForm(formData);
    }, [formData, setContextForm]);

    const isFormValid = useMemo(() => {
        const result = schoolPackageCreateSchema.safeParse(formData);
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
                    duration_minutes: formData.duration_minutes,
                    description: formData.description || null,
                    price_per_student: formData.price_per_student,
                    capacity_students: formData.capacity_students,
                    capacity_equipment: formData.capacity_equipment,
                    category_equipment: formData.category_equipment,
                    package_type: formData.package_type,
                    is_public: formData.is_public,
                }),
            onSuccess: async (data) => {
                const packageMetadata = {
                    id: data.id,
                    description: data.description,
                    durationMinutes: data.duration_minutes,
                    pricePerStudent: data.price_per_student,
                    capacityStudents: data.capacity_students,
                    capacityEquipment: data.capacity_equipment,
                    categoryEquipment: data.category_equipment,
                    packageType: data.package_type,
                    isPublic: data.is_public,
                };

                await handlePostCreation({
                    entityId: data.id,
                    entityType: "package",
                    metadata: packageMetadata,
                    closeDialog: () => { /* no-op on page */ },
                    onSelectId: () => { /* no-op on page */ },
                    onRefresh: () => Promise.resolve(),
                    onAddToQueue: () => {
                        addToQueue("packages", {
                            id: data.id,
                            name: formData.description,
                            timestamp: Date.now(),
                            type: "package",
                            metadata: packageMetadata,
                        });
                    },
                    setFormData,
                    defaultForm: { ...defaultPackageForm },
                });
                setFormKey((prev) => prev + 1);
            },
            successMessage: `Package created: ${formData.description}`,
        });
        setLoading(false);
    }, [isFormValid, formData, addToQueue, handleEntityCreation, handlePostCreation]);

    // Register submit handler in context
    useEffect(() => {
        registerSubmitHandler(handleSubmit);
    }, [handleSubmit, registerSubmitHandler]);

    return (
        <div className="bg-card rounded-lg border border-border">
            <div className="p-6">
                <Package4SchoolForm
                    key={formKey}
                    formData={formData}
                    onFormDataChange={setFormData}
                    isFormReady={isFormValid}
                    onSubmit={handleSubmit}
                    isLoading={loading}
                    showSubmit={true}
                />
            </div>
        </div>
    );
}
