"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRegisterData, useStudentFormState, useFormSubmission } from "../RegisterContext";
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
    const { addStudent, addToQueue } = useRegisterData();
    const { form: contextForm, setForm: setContextForm } = useStudentFormState();
    const { setStudentFormValid, setStudentSubmit } = useFormSubmission();
    const [formData, setFormData] = useState<StudentFormData>(contextForm || defaultStudentForm);
    const [loading, setLoading] = useState(false);

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
        setStudentFormValid(isFormValid);
    }, [isFormValid, setStudentFormValid]);

    // Define and memoize submit handler
    const handleSubmit = useCallback(async () => {
        if (!isFormValid) return;

        setLoading(true);

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
                setLoading(false);
                return;
            }

            // Optimistic update
            const newStudent = {
                id: result.data.schoolStudent.id,
                studentId: result.data.student.id,
                description: result.data.schoolStudent.description,
                active: true,
                rental: result.data.schoolStudent.rental,
                createdAt: new Date(),
                updatedAt: new Date(),
                student: result.data.student,
            };
            addStudent(newStudent);

            // Add to queue
            addToQueue("students", {
                id: result.data.student.id,
                name: `${formData.firstName} ${formData.lastName}`,
                timestamp: Date.now(),
            });

            toast.success(`Student created: ${formData.firstName} ${formData.lastName}`);

            // Reset form
            setFormData(defaultStudentForm);
            setContextForm(null);
            setLoading(false);
        } catch {
            toast.error("An unexpected error occurred");
            setLoading(false);
        }
    }, [isFormValid, formData, addStudent, addToQueue, setContextForm]);

    // Register submit handler in context
    useEffect(() => {
        setStudentSubmit(() => handleSubmit);
    }, [handleSubmit, setStudentSubmit]);

    return (
        <div className="bg-card rounded-lg border border-border">
            <div className="p-6">
                <StudentForm formData={formData} onFormDataChange={setFormData} isFormReady={isFormValid} />
            </div>
        </div>
    );
}
