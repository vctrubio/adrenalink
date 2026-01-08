"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { TeacherTable } from "@/src/components/tables/TeacherTable";
import { TeacherCommissionBadge } from "@/src/components/ui/badge";
import { EntityAddDialog } from "@/src/components/ui/EntityAddDialog";
import TeacherForm, { teacherFormSchema, type TeacherFormData } from "@/src/components/forms/school/Teacher4SchoolForm";
import { createAndLinkTeacher } from "@/supabase/server/register";
import { useRegisterActions, useTeacherFormState, useFormRegistration } from "../RegisterContext";

interface Commission {
    id: string;
    commissionType: string;
    cph: string;
    description: string | null;
}

interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    languages: string[];
    commissions: Commission[];
}

interface TeacherStats {
    totalLessons: number;
    plannedLessons: number;
}

interface TeacherSectionProps {
    teachers: Teacher[];
    selectedTeacher: Teacher | null;
    selectedCommission: Commission | null;
    onSelectTeacher: (teacher: Teacher | null) => void;
    onSelectCommission: (commission: Commission | null) => void;
    onAddCommission?: (teacherId: string, commission: Omit<Commission, "id">) => Promise<void>;
    isExpanded: boolean;
    onToggle: () => void;
    teacherStatsMap?: Record<string, TeacherStats>;
    onClose?: () => void;
}

export function TeacherSection({
    teachers,
    selectedTeacher,
    selectedCommission,
    onSelectTeacher,
    onSelectCommission,
    isExpanded,
    onToggle,
    teacherStatsMap,
    onClose
}: TeacherSectionProps) {
    const teacherEntity = ENTITY_DATA.find(e => e.id === "teacher");
    const pathname = usePathname();
    const router = useRouter();
    const { addTeacher, addToQueue } = useRegisterActions();
    const { form: contextForm, setForm: setContextForm } = useTeacherFormState();
    const { setFormValidity } = useFormRegistration();

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<TeacherFormData>(contextForm || {
        firstName: "",
        lastName: "",
        username: "",
        passport: "",
        country: "",
        phone: "",
        languages: ["English"],
        commissions: [],
    });

    // Update context when form data changes
    useEffect(() => {
        setContextForm(formData);
    }, [formData, setContextForm]);

    const isFormValid = useMemo(() => {
        return teacherFormSchema.safeParse(formData).success;
    }, [formData]);

    // Update form validity in context
    useEffect(() => {
        setFormValidity(isFormValid);
    }, [isFormValid, setFormValidity]);

    const title = selectedTeacher && selectedCommission
        ? (
            <div className="flex items-center gap-2">
                <span>{selectedTeacher.firstName} {selectedTeacher.lastName}</span>
                <TeacherCommissionBadge value={selectedCommission.cph} type={selectedCommission.commissionType} />
            </div>
        )
        : selectedTeacher
        ? `${selectedTeacher.firstName} - Select Commission`
        : "Teacher";

    const handleSubmit = useCallback(async () => {
        if (!isFormValid) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            const result = await createAndLinkTeacher({
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

            // Add to queue with full teacher data
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

            // Optimistic update to data
            const newTeacher = {
                id: result.data.teacher.id,
                firstName: result.data.teacher.firstName,
                lastName: result.data.teacher.lastName,
                username: result.data.teacher.username,
                languages: result.data.teacher.languages,
                commissions: [],
            };
            addTeacher(newTeacher);

            // Behavior depends on current route
            if (pathname === "/register") {
                // On booking form: close dialog, navigate with param
                setIsDialogOpen(false);
                router.push(`/register?add=teacher:${result.data.teacher.id}`);
            } else {
                // On /register/teacher: keep dialog open, reset form
                setFormData({
                    firstName: "",
                    lastName: "",
                    username: "",
                    passport: "",
                    country: "",
                    phone: "",
                    languages: ["English"],
                    commissions: [],
                });
            }

            setLoading(false);
        } catch (error) {
            console.error("Teacher creation error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(errorMessage);
            setLoading(false);
        }
    }, [isFormValid, formData, addTeacher, addToQueue, pathname, router]);

    return (
        <>
            <Section
                id="teacher-section"
                title={title}
                isExpanded={isExpanded}
                onToggle={onToggle}
                entityIcon={teacherEntity?.icon}
                entityColor={teacherEntity?.color}
                optional={true}
                hasSelection={selectedTeacher !== null}
                onClear={() => {
                    onSelectTeacher(null);
                    onSelectCommission(null);
                }}
                onOptional={onClose}
                showAddButton={true}
                onAddClick={() => setIsDialogOpen(true)}
            >
                <TeacherTable
                    teachers={teachers}
                    selectedTeacher={selectedTeacher}
                    selectedCommission={selectedCommission}
                    onSelectTeacher={onSelectTeacher}
                    onSelectCommission={onSelectCommission}
                    onSectionClose={onToggle}
                    teacherStatsMap={teacherStatsMap}
                />
            </Section>

            <EntityAddDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            >
                <TeacherForm
                    formData={formData}
                    onFormDataChange={setFormData}
                    isFormReady={isFormValid}
                    onSubmit={handleSubmit}
                    isLoading={loading}
                    onClose={() => setIsDialogOpen(false)}
                />
            </EntityAddDialog>
        </>
    );
}
