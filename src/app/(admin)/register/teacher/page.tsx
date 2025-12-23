"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRegisterData, useTeacherFormState, useFormSubmission } from "../RegisterContext";
import TeacherForm, { TeacherFormData, teacherFormSchema } from "@/src/components/forms/Teacher4SchoolForm";
import { createAndLinkTeacher } from "@/actions/register-action";
import toast from "react-hot-toast";

const defaultTeacherForm: TeacherFormData = {
    firstName: "",
    lastName: "",
    username: "",
    passport: "",
    country: "",
    phone: "",
    languages: ["English"],
    commissions: [],
};

export default function TeacherPage() {
    const router = useRouter();
    const { addTeacher, addToQueue } = useRegisterData();
    const { form: contextForm, setForm: setContextForm } = useTeacherFormState();
    const { setTeacherFormValid, setTeacherSubmit } = useFormSubmission();
    const [formData, setFormData] = useState<TeacherFormData>(contextForm || defaultTeacherForm);
    const [loading, setLoading] = useState(false);

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
        setTeacherFormValid(isFormValid);
    }, [isFormValid, setTeacherFormValid]);

    // Define and memoize submit handler
    const handleSubmit = useCallback(async () => {
        if (!isFormValid) return;

        setLoading(true);

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
                setLoading(false);
                return;
            }

            // Optimistic update
            const newTeacher = {
                id: result.data.teacher.id,
                firstName: result.data.teacher.firstName,
                lastName: result.data.teacher.lastName,
                username: result.data.teacher.username,
                languages: result.data.teacher.languages,
                commissions: [],
            };
            addTeacher(newTeacher);

            // Add to queue
            addToQueue("teachers", {
                id: result.data.teacher.id,
                name: `${formData.firstName} ${formData.lastName}`,
                timestamp: Date.now(),
            });

            toast.success(`Teacher created: ${formData.firstName} ${formData.lastName}`);

            // Reset form
            setFormData(defaultTeacherForm);
            setContextForm(null);
            setLoading(false);
        } catch {
            toast.error("An unexpected error occurred");
            setLoading(false);
        }
    }, [isFormValid, formData, addTeacher, addToQueue, setContextForm]);

    // Register submit handler in context
    useEffect(() => {
        setTeacherSubmit(() => handleSubmit);
    }, [handleSubmit, setTeacherSubmit]);

    return (
        <div className="bg-card rounded-lg border border-border">
            <div className="p-6">
                <TeacherForm formData={formData} onFormDataChange={setFormData} isFormReady={isFormValid} />
            </div>
        </div>
    );
}

