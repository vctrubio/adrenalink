"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRegisterActions, useTeacherFormState, useFormRegistration } from "../RegisterContext";
import { TeacherCreateForm, teacherCreateSchema, defaultTeacherForm } from "@/src/validation/teacher";
import TeacherForm from "@/src/components/forms/school/Teacher4SchoolForm";
import { createAndLinkTeacher } from "@/supabase/server/register";
import toast from "react-hot-toast";

export default function TeacherPage() {
    const { addToQueue, handleEntityCreation, handlePostCreation } = useRegisterActions();
    const { form: contextForm, setForm: setContextForm } = useTeacherFormState();
    const { registerSubmitHandler, setFormValidity } = useFormRegistration();
    const [formData, setFormData] = useState<TeacherCreateForm>(contextForm || defaultTeacherForm);
    const [loading, setLoading] = useState(false);

    // Update context when form data changes
    useEffect(() => {
        setContextForm(formData);
    }, [formData, setContextForm]);

    const isFormValid = useMemo(() => {
        const result = teacherCreateSchema.safeParse(formData);
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
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        username: formData.username,
                        passport: formData.passport,
                        country: formData.country,
                        phone: formData.phone,
                        languages: formData.languages,
                    },
                    formData.commissions.map((c) => ({
                        commission_type: c.commission_type as "fixed" | "percentage",
                        cph: c.cph.toString(),
                        description: c.description,
                    })),
                ),
            onSuccess: async (data) => {
                await handlePostCreation({
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
                                schema: {
                                    ...data.teacher,
                                    commissions: (data.commissions || []).map((c: any) => ({
                                        id: c.id,
                                        commissionType: c.commission_type,
                                        cph: c.cph,
                                        description: c.description,
                                    })),
                                },
                                lessonStats: { totalLessons: 0, completedLessons: 0 },
                            },
                        });
                    },
                    setFormData,
                    defaultForm: defaultTeacherForm,
                });
            },
            successMessage: `Teacher created: ${formData.first_name} ${formData.last_name}`,
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
