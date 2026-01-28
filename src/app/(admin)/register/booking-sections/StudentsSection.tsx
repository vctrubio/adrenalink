"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { MemoStudentTable as StudentTable } from "@/src/components/tables/StudentTable";
import { EntityAddDialog } from "@/src/components/ui/EntityAddDialog";
import StudentForm, { studentFormSchema, type StudentFormData } from "@/src/components/forms/school/Student4SchoolForm";
import { defaultStudentForm, studentCreateSchema, type StudentCreateForm } from "@/src/validation/student";
import { createAndLinkStudent } from "@/supabase/server/register";
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
    totalEventCount: number;
    totalEventDuration: number;
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
    onExpand?: () => void;
    studentStatsMap?: Record<string, StudentStats>;
    selectedPackage?: Package | null;
}

export function StudentsSection({
    students,
    selectedStudentIds,
    onToggle,
    capacity,
    isExpanded,
    onSectionToggle,
    onExpand,
    studentStatsMap,
    selectedPackage,
}: StudentsSectionProps) {
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const { form: contextForm, setForm: setContextForm } = useStudentFormState();
    const { setFormValidity } = useFormRegistration();
    const { refreshData, addToQueue, handleEntityCreation, handlePostCreation } = useRegisterActions();

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formData, setFormData] = useState<StudentCreateForm>(contextForm || defaultStudentForm);

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

    const selectedStudentNames = selectedStudentIds
        .map((id) => {
            const s = students.find((s) => s.student.id === id);
            return s ? `${s.student.firstName} ${s.student.lastName}` : null;
        })
        .filter(Boolean)
        .join(", ");

    const title =
        selectedStudentIds.length > 0
            ? selectedStudentNames
            : selectedPackage
              ? `Select Students (${selectedPackage.capacityStudents})`
              : capacity
                ? `Select Students (${capacity})`
                : "Select Students";

    const handleSubmit = useCallback(async () => {
        setSubmitLoading(true);
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
                    entityType: "student",
                    closeDialog: () => setIsDialogOpen(false),
                    onSelectId: () => onToggle(data.student.id),
                    onRefresh: refreshData,
                    onAddToQueue: () => {
                        const { student } = data;
                        addToQueue("students", {
                            id: student.id,
                            name: `${student.first_name} ${student.last_name}`,
                            timestamp: Date.now(),
                            type: "student",
                            metadata: data, // contains student and schoolStudent
                        });
                    },
                    setFormData,
                    defaultForm: defaultStudentForm,
                });
            },
            successMessage: `Student created: ${formData.first_name} ${formData.last_name}`,
        });
        setSubmitLoading(false);
    }, [isFormValid, formData, onToggle, refreshData, handleEntityCreation, handlePostCreation, addToQueue]);

    return (
        <>
            <Section
                id="students-section"
                title={title}
                isExpanded={isExpanded}
                onToggle={onSectionToggle}
                onExpand={onExpand}
                entityIcon={studentEntity?.icon}
                entityColor={studentEntity?.color}
                state={{
                    isSelected: selectedStudentIds.length > 0,
                }}
                hasSelection={selectedStudentIds.length > 0}
                onClear={() => {
                    selectedStudentIds.forEach((id) => onToggle(id));
                }}
                showAddButton={true}
                onAddClick={() => {
                    setFormData(defaultStudentForm);
                    setIsDialogOpen(true);
                }}
            >
                <StudentTable
                    students={students}
                    selectedStudentIds={selectedStudentIds}
                    onToggle={onToggle}
                    capacity={capacity}
                    studentStatsMap={studentStatsMap}
                />
            </Section>

            <EntityAddDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                <StudentForm
                    formData={formData}
                    onFormDataChange={setFormData}
                    isFormReady={isFormValid}
                    onSubmit={handleSubmit}
                    isLoading={submitLoading}
                    onClose={() => setIsDialogOpen(false)}
                />
            </EntityAddDialog>
        </>
    );
}
