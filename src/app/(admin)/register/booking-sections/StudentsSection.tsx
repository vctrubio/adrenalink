"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { MemoStudentTable as StudentTable } from "@/src/components/tables/StudentTable";
import { EntityAddDialog } from "@/src/components/ui/EntityAddDialog";
import StudentForm, { studentFormSchema, type StudentFormData } from "@/src/components/forms/school/Student4SchoolForm";
import { createAndLinkStudent } from "@/supabase/server/register";
import { useStudentFormState, useFormRegistration, useRegisterActions } from "../RegisterContext";
import { handleEntityCreation, handlePostCreation } from "@/backend/RegisterSection";

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
    const pathname = usePathname();
    const router = useRouter();
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const { form: contextForm, setForm: setContextForm } = useStudentFormState();
    const { setFormValidity } = useFormRegistration();
    const { refreshData } = useRegisterActions();

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
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
        setSubmitLoading(true);
        await handleEntityCreation({
            isFormValid,
            entityName: "Student",
            createFn: () =>
                createAndLinkStudent(
                    {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        passport: formData.passport,
                        country: formData.country,
                        phone: formData.phone,
                        languages: formData.languages,
                    },
                    formData.canRent,
                    formData.description || undefined,
                ),
            onSuccess: async (data) => {
                await handlePostCreation({
                    pathname,
                    entityId: data.student.id,
                    closeDialog: () => setIsDialogOpen(false),
                    onSelectId: () => onToggle(data.student.id),
                    onRefresh: refreshData,
                    onAddToQueue: () => {},
                    setFormData,
                    defaultForm: defaultStudentForm,
                });
            },
            successMessage: `Student created: ${formData.firstName} ${formData.lastName}`,
        });
        setSubmitLoading(false);
    }, [isFormValid, formData, onToggle, refreshData, pathname, router]);

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
                    isLoading={submitLoading}
                />
            </EntityAddDialog>
        </>
    );
}
