"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { MemoTeacherTable as TeacherTable } from "@/src/components/tables/TeacherTable";
import { CommissionTypeValue } from "@/src/components/ui/badge/commission-type-value";
import { EntityAddDialog } from "@/src/components/ui/EntityAddDialog";
import TeacherForm, { teacherFormSchema, type TeacherFormData } from "@/src/components/forms/school/Teacher4SchoolForm";
import { createAndLinkTeacher } from "@/supabase/server/register";
import { useRegisterActions, useTeacherFormState, useFormRegistration } from "../RegisterContext";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { handleEntityCreation, handlePostCreation } from "@/backend/RegisterSection";
import type { TeacherProvider } from "@/supabase/server/teachers";

interface Commission {
    id: string;
    commissionType: string;
    cph: string;
    description: string | null;
}

interface TeacherSectionProps {
    teachers: TeacherProvider[];
    selectedTeacher: TeacherProvider | null;
    selectedCommission: Commission | null;
    onSelectTeacher: (teacher: TeacherProvider | null) => void;
    onSelectCommission: (commission: Commission | null) => void;
    onAddCommission?: (teacherId: string, commission: Omit<Commission, "id">) => Promise<void>;
    isExpanded: boolean;
    onToggle: () => void;
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
    onClose,
}: TeacherSectionProps) {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
    const pathname = usePathname();
    const router = useRouter();
    const { addToQueue, refreshData } = useRegisterActions();
    const { form: contextForm, setForm: setContextForm } = useTeacherFormState();
    const { setFormValidity } = useFormRegistration();
    // Refetch teachers from hook to get updated commission data when new commission is added
    const { refetch: refetchTeachers } = useSchoolTeachers();

    // Build stats map from teachers' lessonStats
    const teacherStatsMap = useMemo(() => {
        return teachers.reduce(
            (acc, teacher) => {
                acc[teacher.schema.id] = {
                    totalLessons: teacher.lessonStats.totalLessons,
                    completedLessons: teacher.lessonStats.completedLessons,
                };
                return acc;
            },
            {} as Record<string, { totalLessons: number; completedLessons: number }>,
        );
    }, [teachers]);

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formData, setFormData] = useState<TeacherFormData>(
        contextForm || {
            firstName: "",
            lastName: "",
            username: "",
            passport: "",
            country: "",
            phone: "",
            languages: ["English"],
            commissions: [],
        },
    );

    // Update context when form data changes
    useEffect(() => {
        console.log("[TeacherSection] formData changed:", { formDataChanged: formData });
        setContextForm(formData);
    }, [formData, setContextForm]);

    const isFormValid = useMemo(() => {
        return teacherFormSchema.safeParse(formData).success;
    }, [formData]);

    // Update form validity in context
    useEffect(() => {
        console.log("[TeacherSection] form validity changed:", { isFormValid });
        setFormValidity(isFormValid);
    }, [isFormValid, setFormValidity]);

    const title =
        selectedTeacher && selectedCommission ? (
            <div className="flex items-center gap-2">
                <span>{selectedTeacher.schema.username}</span>
                <CommissionTypeValue
                    value={selectedCommission.cph}
                    type={selectedCommission.commissionType as "fixed" | "percentage"}
                />
            </div>
        ) : selectedTeacher ? (
            `${selectedTeacher.schema.username} - Select Commission`
        ) : (
            "Teacher"
        );

    const handleSubmit = useCallback(async () => {
        setSubmitLoading(true);
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
                    pathname,
                    entityId: data.teacher.id,
                    closeDialog: () => setIsDialogOpen(false),
                    onRefresh: refreshData,
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
                    defaultForm: {
                        firstName: "",
                        lastName: "",
                        username: "",
                        passport: "",
                        country: "",
                        phone: "",
                        languages: ["English"],
                        commissions: [],
                    },
                });
            },
            successMessage: `Teacher created: ${formData.firstName} ${formData.lastName}`,
        });
        setSubmitLoading(false);
    }, [isFormValid, formData, addToQueue, refreshData, pathname, router]);

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
                    onCommissionAdded={refetchTeachers}
                />
            </Section>

            <EntityAddDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                <TeacherForm
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
