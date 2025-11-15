"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRegisterData } from "../RegisterContext";
import TeacherForm, { TeacherFormData, teacherFormSchema } from "@/src/components/forms/Teacher4SchoolForm";
import { createAndLinkTeacher } from "@/actions/register-action";
import RegisterController from "../RegisterController";
import { RegisterFormLayout } from "@/src/components/layouts/RegisterFormLayout";

export default function TeacherPage() {
    const router = useRouter();
    const { school } = useRegisterData();
    const [formData, setFormData] = useState<TeacherFormData>({
        firstName: "",
        lastName: "",
        username: "",
        passport: "",
        country: "",
        phone: "",
        languages: ["English"],
        commissions: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFormValid = useMemo(() => {
        const result = teacherFormSchema.safeParse(formData);
        return result.success;
    }, [formData]);

    const isValid = () => {
        const result = teacherFormSchema.safeParse(formData);
        return result.success;
    };

    const handleSubmit = async () => {
        if (!isValid()) return;

        setLoading(true);
        setError(null);

        try {
            // Create teacher and link to school with commissions
            const result = await createAndLinkTeacher(
                {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    username: formData.username,
                    passport: formData.passport,
                    country: formData.country,
                    phone: formData.phone,
                    languages: formData.languages,
                },
                formData.commissions.map(c => ({
                    commissionType: c.commissionType,
                    commissionValue: c.commissionValue,
                    commissionDescription: c.commissionDescription,
                }))
            );

            if (!result.success) {
                setError(result.error || "Failed to create teacher");
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
                    activeForm="teacher"
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
                    teacherFormData={formData}
                    error={error}
                />
            }
            form={<TeacherForm formData={formData} onFormDataChange={setFormData} isFormReady={isFormValid} />}
        />
    );
}

