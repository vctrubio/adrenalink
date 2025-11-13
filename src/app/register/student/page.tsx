"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRegisterData } from "../RegisterContext";
import StudentForm, { StudentFormData, studentFormSchema } from "@/src/components/forms/Student4SchoolForm";
import { createAndLinkStudent } from "@/actions/register-action";
import RegisterController from "../RegisterController";
import { RegisterFormLayout } from "@/src/components/layouts/RegisterFormLayout";

export default function StudentPage() {
    const router = useRouter();
    const { school } = useRegisterData();
    const [formData, setFormData] = useState<StudentFormData>({
        firstName: "",
        lastName: "",
        passport: "",
        country: "",
        phone: "",
        languages: ["English"],
        description: "",
        canRent: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFormValid = useMemo(() => {
        const result = studentFormSchema.safeParse(formData);
        return result.success;
    }, [formData]);

    const isValid = () => {
        const result = studentFormSchema.safeParse(formData);
        return result.success;
    };

    const handleSubmit = async () => {
        if (!isValid()) return;

        setLoading(true);
        setError(null);

        try {
            // Create student and link to school in one transaction
            const result = await createAndLinkStudent(
                {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    passport: formData.passport,
                    country: formData.country,
                    phone: formData.phone,
                    languages: formData.languages,
                },
                formData.canRent,
                formData.description || undefined
            );

            if (!result.success) {
                setError(result.error || "Failed to create student");
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
                    activeForm="student"
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
                    studentFormData={formData}
                    error={error}
                />
            }
            form={<StudentForm formData={formData} onFormDataChange={setFormData} isFormReady={isFormValid} />}
        />
    );
}
