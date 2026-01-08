"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRegisterActions, useTeacherFormState, useFormRegistration } from "../RegisterContext";
import TeacherForm, { TeacherFormData, teacherFormSchema } from "@/src/components/forms/school/Teacher4SchoolForm";
import { defaultTeacherForm } from "@/types/form-entities";
import { createAndLinkTeacher } from "@/supabase/server/register";
import toast from "react-hot-toast";

export default function TeacherPage() {
    const router = useRouter();
    const { addToQueue } = useRegisterActions();
    const { form: contextForm, setForm: setContextForm } = useTeacherFormState();
    const { registerSubmitHandler, setFormValidity } = useFormRegistration();
    const [formData, setFormData] = useState<TeacherFormData>(contextForm || defaultTeacherForm);

    // Update context when form data changes
    useEffect(() => {
        setContextForm(formData);
    }, [formData, setContextForm]);

    const isFormValid = useMemo(() => {
        const result = teacherFormSchema.safeParse(formData);
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
                toast.error(result.error || "Failed to create teacher");
                return;
            }

            // Add to queue for quick access in booking form
            addToQueue("teachers", {
                id: result.data.teacher.id,
                name: result.data.teacher.username,
                timestamp: Date.now(),
                type: "teacher",
                metadata: {
                    ...result.data.teacher,
                    commissions: result.data.teacher.commissions || [],
                },
            });

            // Reset form but keep country and phone for next entry
            setFormData({
                firstName: "",
                lastName: "",
                username: "",
                passport: "",
                country: formData.country,
                phone: formData.phone,
                languages: [],
                commissions: [],
            });
        } catch (error) {
            console.error("Teacher creation error:", error);
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
                <TeacherForm
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