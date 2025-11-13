"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRegisterData } from "../RegisterContext";
import PackageForm, { PackageFormData, packageFormSchema } from "@/src/components/forms/Package4SchoolForm";
import { createAndLinkPackage } from "@/actions/register-action";
import RegisterController from "../RegisterController";
import { RegisterFormLayout } from "@/src/components/layouts/RegisterFormLayout";

export default function PackagePage() {
    const router = useRouter();
    const { school } = useRegisterData();
    const [formData, setFormData] = useState<PackageFormData>({
        durationMinutes: 60, // Default to 1 hour
        description: "",
        pricePerStudent: 0,
        capacityStudents: 1,
        capacityEquipment: 1,
        categoryEquipment: "kite", // Default category
        packageType: "lessons", // Default type
        isPublic: true, // Default to public
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFormValid = useMemo(() => {
        const result = packageFormSchema.safeParse(formData);
        return result.success;
    }, [formData]);

    const isValid = () => {
        const result = packageFormSchema.safeParse(formData);
        return result.success;
    };

    const handleSubmit = async () => {
        if (!isValid()) return;

        setLoading(true);
        setError(null);

        try {
            // Create package and link to school
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
                setError(result.error || "Failed to create package");
                setLoading(false);
                return;
            }

            // Success - navigate back to register
            router.push("/register");
            router.refresh();
            setLoading(false);
        } catch {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    const handleReset = () => {
        router.push("/register");
    };

    return (
        <RegisterFormLayout
            controller={
                <RegisterController
                    activeForm="package"
                    selectedPackage={null}
                    selectedStudents={[]}
                    selectedTeacher={null}
                    selectedCommission={null}
                    dateRange={{ startDate: "", endDate: "" }}
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    onScrollToSection={() => {}}
                    loading={loading}
                    canCreateBooking={isValid()}
                    school={school}
                    packageFormData={formData}
                    error={error}
                />
            }
            form={<PackageForm formData={formData} onFormDataChange={setFormData} isFormReady={isFormValid} />}
        />
    );
}

