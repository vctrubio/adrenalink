"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { PackageTable } from "@/src/components/tables/PackageTable";
import { EntityAddDialog } from "@/src/components/ui/EntityAddDialog";
import Package4SchoolForm, { packageFormSchema, type PackageFormData } from "@/src/components/forms/school/Package4SchoolForm";
import { defaultPackageForm, SchoolPackageCreateForm, schoolPackageCreateSchema } from "@/src/validation/school-package";
import { createSchoolPackage } from "@/supabase/server/register";
import { useRegisterActions, usePackageFormState, useFormRegistration } from "../RegisterContext";

interface Package {
    id: string;
    description: string;
    durationMinutes: number;
    pricePerStudent: number;
    capacityStudents: number;
    capacityEquipment: number;
    categoryEquipment: string;
    isPublic?: boolean;
}

interface PackageSectionProps {
    packages: Package[];
    selectedPackage: Package | null;
    onSelect: (pkg: Package) => void;
    isExpanded: boolean;
    onToggle: () => void;
    onExpand?: () => void;
    selectedStudentCount?: number;
    selectedEquipmentCategory?: string | null;
    previousSectionSelected?: boolean;
    isLast?: boolean;
}

export function PackageSection({
    packages,
    selectedPackage,
    onSelect,
    isExpanded,
    onToggle,
    onExpand,
    selectedStudentCount = 0,
    selectedEquipmentCategory = null,
    previousSectionSelected = false,
    isLast = false,
}: PackageSectionProps) {
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage");
    const { refreshData, addToQueue, handleEntityCreation, handlePostCreation } = useRegisterActions();
    const { form: contextForm, setForm: setContextForm } = usePackageFormState();
    const { setFormValidity } = useFormRegistration();

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formData, setFormData] = useState<SchoolPackageCreateForm>(contextForm || defaultPackageForm);

    // Update context when form data changes
    useEffect(() => {
        setContextForm(formData);
    }, [formData, setContextForm]);

    const isFormValid = useMemo(() => {
        const result = schoolPackageCreateSchema.safeParse(formData);
        return result.success;
    }, [formData]);

    // Update form validity in context
    useEffect(() => {
        setFormValidity(isFormValid);
    }, [isFormValid, setFormValidity]);

    // Reset form when dialog opens
    useEffect(() => {
        if (isDialogOpen) {
            setFormData(defaultPackageForm);
        }
    }, [isDialogOpen]);

    const title = selectedPackage ? selectedPackage.description : "Select Package";

    const handleSubmit = useCallback(async () => {
        setSubmitLoading(true);
        await handleEntityCreation({
            isFormValid,
            entityName: "Package",
            createFn: () =>
                createSchoolPackage({
                    duration_minutes: formData.duration_minutes,
                    description: formData.description,
                    price_per_student: formData.price_per_student,
                    capacity_students: formData.capacity_students,
                    capacity_equipment: formData.capacity_equipment,
                    category_equipment: formData.category_equipment,
                    package_type: formData.package_type,
                    is_public: formData.is_public,
                }),
            onSuccess: async (data) => {
                const newPackage: Package = {
                    id: data.id,
                    description: data.description,
                    durationMinutes: data.duration_minutes,
                    pricePerStudent: data.price_per_student,
                    capacityStudents: data.capacity_students,
                    capacityEquipment: data.capacity_equipment,
                    categoryEquipment: data.category_equipment,
                    isPublic: data.is_public,
                };

                await handlePostCreation({
                    entityId: data.id,
                    closeDialog: () => setIsDialogOpen(false),
                    onSelectId: () => onSelect(newPackage),
                    onRefresh: refreshData,
                    onAddToQueue: () => {
                        addToQueue("packages", {
                            id: data.id,
                            name: data.description,
                            timestamp: Date.now(),
                            type: "package",
                            metadata: newPackage,
                        });
                    },
                    setFormData,
                    defaultForm: defaultPackageForm,
                });
            },
            successMessage: `Package created: ${formData.description}`,
        });
        setSubmitLoading(false);
    }, [isFormValid, formData, onSelect, refreshData, addToQueue, handleEntityCreation, handlePostCreation]);

    return (
        <>
            <Section
                id="package-section"
                title={title}
                isExpanded={isExpanded}
                onToggle={onToggle}
                onExpand={onExpand}
                entityIcon={packageEntity?.icon}
                entityColor={packageEntity?.color}
                state={{
                    isSelected: selectedPackage !== null,
                    isLast,
                    previousSectionSelected,
                }}
                hasSelection={selectedPackage !== null}
                onClear={() => {
                    onSelect(null as any);
                }}
                showAddButton={true}
                onAddClick={() => setIsDialogOpen(true)}
            >
                <PackageTable
                    packages={
                        selectedEquipmentCategory
                            ? packages.filter((pkg) => pkg.categoryEquipment === selectedEquipmentCategory)
                            : packages
                    }
                    selectedPackage={selectedPackage}
                    onSelect={onSelect}
                    selectedStudentCount={selectedStudentCount}
                />
            </Section>

            <EntityAddDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                <Package4SchoolForm
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
