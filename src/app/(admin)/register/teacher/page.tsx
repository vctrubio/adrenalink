"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRegisterActions, useTeacherFormState, useFormRegistration } from "../RegisterContext";
import TeacherForm, { TeacherFormData, teacherFormSchema } from "@/src/components/forms/school/Teacher4SchoolForm";
import { createAndLinkTeacher } from "@/supabase/server/register";
import { handleEntityCreation, handlePostCreation } from "@/backend/RegisterSection";
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
    const { addToQueue } = useRegisterActions();
    const { form: contextForm, setForm: setContextForm } = useTeacherFormState();
    const { registerSubmitHandler, setFormValidity } = useFormRegistration();
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
        setFormValidity(isFormValid);
    }, [isFormValid, setFormValidity]);

    // Define and memoize submit handler
    const handleSubmit = useCallback(async () => {
        setLoading(true);
        await handleEntityCreation({
            isFormValid,
            entityName: "Teacher",
            createFn: () =>
                createAndLinkTeacher(
                    {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        username: formData.username,
                        passport: formData.passport,
                        country: formData.country,
                        phone: formData.phone,
                        languages: formData.languages,
                    },
                    formData.commissions.map((c) => ({
                        commission_type: c.commissionType as "fixed" | "percentage",
                        cph: c.commissionValue,
                        description: c.commissionDescription,
                    })),
                ),
            onSuccess: async (data) => {
                await handlePostCreation({
                    pathname: "/register/teacher",
                    entityId: data.teacher.id,
                    closeDialog: () => {},
                    onSelectId: () => {},
                    onRefresh: async () => {},
                    onAddToQueue: () => {
                        addToQueue("teachers", {
                            id: data.teacher.id,
                            name: data.teacher.username,
                            timestamp: Date.now(),
                            type: "teacher",
                            metadata: {
                                ...data.teacher,
                                commissions: data.teacher.commissions || [],
                            },
                        });
                    },
                    setFormData,
                    defaultForm: defaultTeacherForm,
                });
            },
            successMessage: `Teacher created: ${formData.firstName} ${formData.lastName}`,
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
                <TeacherForm
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