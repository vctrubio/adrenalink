"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRegisterActions, useStudentFormState, useFormRegistration } from "../RegisterContext";
import StudentForm, { StudentFormData, studentFormSchema } from "@/src/components/forms/Student4SchoolForm";
import { createAndLinkStudent } from "@/actions/register-action";
import toast from "react-hot-toast";

const defaultStudentForm: StudentFormData = {
    firstName: "",
    lastName: "",
    passport: "",
    country: "",
    phone: "",
    languages: ["English"],
    description: "",
    canRent: false,
};

export default function StudentPage() {
    const router = useRouter();
    const { addToQueue } = useRegisterActions();
    const { form: contextForm, setForm: setContextForm } = useStudentFormState();
    const { registerSubmitHandler, setFormValidity } = useFormRegistration();
    const [formData, setFormData] = useState<StudentFormData>(contextForm || defaultStudentForm);

    // Update context when form data changes
    useEffect(() => {
        setContextForm(formData);
    }, [formData, setContextForm]);

    const isFormValid = useMemo(() => {
        const result = studentFormSchema.safeParse(formData);
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
                toast.error(result.error || "Failed to create student");
                return;
            }

            // Add to queue for quick access in booking form
            addToQueue("students", {
                id: result.data.student.id,
                name: `${formData.firstName} ${formData.lastName}`,
                timestamp: Date.now(),
                type: "student",
            });

            toast.success(`Student added: ${formData.firstName} ${formData.lastName}`);

            // Reset form but keep country and phone for next entry
            setFormData({
                firstName: "",
                lastName: "",
                passport: "",
                country: formData.country,
                phone: formData.phone,
                languages: ["English"],
                description: "",
                canRent: false,
            });
        } catch (error) {
            console.error("Student creation error:", error);
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
                <StudentForm formData={formData} onFormDataChange={setFormData} isFormReady={isFormValid} />
            </div>
        </div>
    );
}