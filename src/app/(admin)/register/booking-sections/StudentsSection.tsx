"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { StudentTable } from "@/src/components/tables/StudentTable";
import { EntityAddDialog } from "@/src/components/ui/EntityAddDialog";
import StudentForm, { studentFormSchema, type StudentFormData } from "@/src/components/forms/school/Student4SchoolForm";
import { createAndLinkStudent } from "@/actions/register-action";
import { useStudentFormState, useFormRegistration, useRegisterActions } from "../RegisterContext";

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    passport: string;
    country: string;
    languages: string[];
}

interface SchoolStudent {
    id: string;
    studentId: string;
    description: string | null;
    active: boolean;
    rental: boolean;
    createdAt: Date;
    updatedAt: Date;
    student: Student;
}

interface StudentStats {
    bookingCount: number;
    durationHours: number;
    allBookingsCompleted?: boolean;
}

interface Package {
    id: string;
    capacityStudents: number;
}

interface StudentsSectionProps {
    students: SchoolStudent[];
    selectedStudentIds: string[];
    onToggle: (studentId: string) => void;
    capacity?: number;
    isExpanded: boolean;
    onSectionToggle: () => void;
    studentStatsMap?: Record<string, StudentStats>;
    selectedPackage?: Package | null;
}

const defaultStudentForm: StudentFormData = {
    firstName: "",
    lastName: "",
    passport: "",
    country: "",
    phone: "",
    languages: [],
    description: "",
    canRent: false,
};

export function StudentsSection({ students, selectedStudentIds, onToggle, capacity, isExpanded, onSectionToggle, studentStatsMap, selectedPackage }: StudentsSectionProps) {
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const { form: contextForm, setForm: setContextForm } = useStudentFormState();
    const { setFormValidity } = useFormRegistration();
    const { refreshData } = useRegisterActions();

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
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

    const selectedStudentNames = selectedStudentIds
        .map((id) => students.find((s) => s.student.id === id)?.student.firstName)
        .filter(Boolean)
        .join(", ");

    const title =
        selectedPackage && selectedStudentIds.length > 0
            ? `(${selectedStudentIds.length}/${selectedPackage.capacityStudents}) ${selectedStudentNames}`
            : selectedPackage
                ? `Select Students (${selectedPackage.capacityStudents})`
                : capacity
                    ? `Select Students (${selectedStudentIds.length}/${capacity})`
                    : selectedStudentIds.length > 0
                        ? `(${selectedStudentIds.length}) ${selectedStudentNames}`
                        : "Select Students";

    const handleSubmit = useCallback(async () => {
        if (!isFormValid) {
            toast.error("Please fill all required fields");
            return;
        }

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
                formData.description || undefined,
            );

            if (!result.success) {
                toast.error(result.error || "Failed to create student");
                setLoading(false);
                return;
            }

            // Refresh data to get the newly created student in the list
            await refreshData();

            // Select the newly created student in the table
            onToggle(result.data.student.id);

            // Close dialog and reset form
            setIsDialogOpen(false);
            setFormData({
                firstName: "",
                lastName: "",
                passport: "",
                country: "",
                phone: "",
                languages: [],
                description: "",
                canRent: false,
            });

            setLoading(false);
        } catch (error) {
            console.error("Student creation error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(errorMessage);
            setLoading(false);
        }
    }, [isFormValid, formData, onToggle, refreshData]);

    return (
        <>
            <Section
                id="students-section"
                title={title}
                isExpanded={isExpanded}
                onToggle={onSectionToggle}
                entityIcon={studentEntity?.icon}
                entityColor={studentEntity?.color}
                hasSelection={selectedStudentIds.length > 0}
                onClear={() => {
                    selectedStudentIds.forEach((id) => onToggle(id));
                }}
                showAddButton={true}
                onAddClick={() => setIsDialogOpen(true)}
            >
                <StudentTable students={students} selectedStudentIds={selectedStudentIds} onToggle={onToggle} capacity={capacity} studentStatsMap={studentStatsMap} />
            </Section>

            <EntityAddDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                <StudentForm
                    formData={formData}
                    onFormDataChange={setFormData}
                    isFormReady={isFormValid}
                    onSubmit={handleSubmit}
                    isLoading={loading}
                />
            </EntityAddDialog>
        </>
    );
}
