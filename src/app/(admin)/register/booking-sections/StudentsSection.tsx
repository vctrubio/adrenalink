"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { StudentTable } from "@/src/components/tables/StudentTable";
import { EntityAddDialog } from "@/src/components/ui/EntityAddDialog";
import StudentForm, { studentFormSchema, type StudentFormData } from "@/src/components/forms/Student4SchoolForm";
import { createAndLinkStudent } from "@/actions/register-action";
import { useRegisterActions } from "../RegisterContext";

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

type StudentStatusFilter = "All" | "New" | "Ongoing";

interface Package {
    id: string;
    capacityStudents: number;
}

interface StudentsSectionProps {
    students: SchoolStudent[];
    selectedStudentIds: string[];
    onToggle: (studentId: string) => void;
    preSelectedId?: string | null;
    capacity?: number;
    isExpanded: boolean;
    onSectionToggle: () => void;
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
    studentStatsMap,
    selectedPackage
}: StudentsSectionProps) {
    const studentEntity = ENTITY_DATA.find(e => e.id === "student");
    const pathname = usePathname();
    const router = useRouter();
    const { addStudent, addToQueue } = useRegisterActions();

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<StudentFormData>({
        firstName: "",
        lastName: "",
        passport: "",
        country: "",
        phone: "",
        languages: ["English"],
        description: "",
        canRent: false,
    });

    const selectedStudentNames = selectedStudentIds
        .map(id => students.find(s => s.student.id === id)?.student.firstName)
        .filter(Boolean)
        .join(", ");

    const title = selectedPackage && selectedStudentIds.length > 0
        ? `(${selectedStudentIds.length}/${selectedPackage.capacityStudents}) ${selectedStudentNames}`
        : selectedPackage
        ? `Select Students (${selectedPackage.capacityStudents})`
        : capacity
        ? `Select Students (${selectedStudentIds.length}/${capacity})`
        : selectedStudentIds.length > 0
        ? `(${selectedStudentIds.length}) ${selectedStudentNames}`
        : "Select Students";

    const handleSubmit = async () => {
        const validation = studentFormSchema.safeParse(formData);
        if (!validation.success) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            console.log("📝 [StudentsSection] Form data before submission:", {
                firstName: formData.firstName,
                lastName: formData.lastName,
                passport: formData.passport,
                country: formData.country,
                phone: formData.phone,
                languages: formData.languages,
                languagesType: typeof formData.languages,
                languagesIsArray: Array.isArray(formData.languages),
            });

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

            // Optimistic update to data
            const newStudent = {
                id: result.data.schoolStudent.id,
                studentId: result.data.student.id,
                description: result.data.schoolStudent.description,
                active: true,
                rental: result.data.schoolStudent.rental,
                createdAt: new Date(),
                updatedAt: new Date(),
                student: result.data.student
            };
            addStudent(newStudent);

            // Behavior depends on current route
            if (pathname === "/register") {
                // On booking form: close dialog, navigate with param
                setIsDialogOpen(false);
                router.push(`/register?add=student:${result.data.student.id}`);
            } else {
                // On /register/student: keep dialog open, reset form
                setFormData({
                    firstName: "",
                    lastName: "",
                    passport: "",
                    country: "",
                    phone: "",
                    languages: ["English"],
                    description: "",
                    canRent: false,
                });
            }

            setLoading(false);
        } catch (error) {
            toast.error("Unexpected error");
            setLoading(false);
        }
    };

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
                    selectedStudentIds.forEach(id => onToggle(id));
                }}
                showAddButton={true}
                onAddClick={() => setIsDialogOpen(true)}
            >
                <StudentTable
                    students={students}
                    selectedStudentIds={selectedStudentIds}
                    onToggle={onToggle}
                    capacity={capacity}
                    studentStatsMap={studentStatsMap}
                />
            </Section>

            <EntityAddDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            >
                <StudentForm
                    formData={formData}
                    onFormDataChange={setFormData}
                    isFormReady={studentFormSchema.safeParse(formData).success}
                />

                {/* Submit button */}
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !studentFormSchema.safeParse(formData).success}
                        className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Creating..." : "Add Student"}
                    </button>
                    <button
                        onClick={() => setIsDialogOpen(false)}
                        disabled={loading}
                        className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </EntityAddDialog>
        </>
    );
}
