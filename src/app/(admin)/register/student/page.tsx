"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRegisterActions, useStudentFormState, useFormRegistration } from "../RegisterContext";
import { StudentCreateForm, studentCreateSchema, defaultStudentForm } from "@/src/validation/student";
import StudentForm from "@/src/components/forms/school/Student4SchoolForm";
import { createAndLinkStudent } from "@/supabase/server/register";
import toast from "react-hot-toast";

export default function StudentPage() {
    const { addToQueue, handleEntityCreation, handlePostCreation } = useRegisterActions();
    const { form: contextForm, setForm: setContextForm } = useStudentFormState();
    const { registerSubmitHandler, setFormValidity } = useFormRegistration();
    const [formData, setFormData] = useState<StudentCreateForm>(contextForm || defaultStudentForm);
    const [loading, setLoading] = useState(false);

    // Update context when form data changes
    useEffect(() => {
        setContextForm(formData);
    }, [formData, setContextForm]);

    const isFormValid = useMemo(() => {
        const result = studentCreateSchema.safeParse(formData);
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
            entityName: "Student",
            createFn: () =>
                createAndLinkStudent(
                    {
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        passport: formData.passport,
                        country: formData.country,
                        phone: formData.phone,
                        languages: formData.languages,
                    },
                    formData.rental,
                    formData.description || undefined,
                ),
            onSuccess: async (data) => {
                await handlePostCreation({
                    entityId: data.student.id,
                    closeDialog: () => {},
                    onSelectId: () => {},
                    onRefresh: async () => {},
                    onAddToQueue: () => {
                        addToQueue("students", {
                            id: data.student.id,
                            name: `${formData.first_name} ${formData.last_name}`,
                            timestamp: Date.now(),
                            type: "student",
                        });
                    },
                    setFormData,
                    defaultForm: defaultStudentForm,
                });
            },
            successMessage: `Student created: ${formData.first_name} ${formData.last_name}`,
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
                <StudentForm
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
