"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { PackageTable } from "@/src/components/tables/PackageTable";
import { EquipmentStudentCapacityBadge } from "@/src/components/ui/badge";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EntityAddDialog } from "@/src/components/ui/EntityAddDialog";
import Package4SchoolForm, { packageFormSchema, type PackageFormData } from "@/src/components/forms/school/Package4SchoolForm";
import { defaultPackageForm } from "@/types/form-entities";
import { createSchoolPackage } from "@/supabase/server/register";
import { useRegisterActions, usePackageFormState, useFormRegistration } from "../RegisterContext";
import { handleEntityCreation, handlePostCreation } from "@/backend/RegisterSection";

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
    selectedStudentCount?: number;
}

export function PackageSection({
    packages,
    selectedPackage,
    onSelect,
    isExpanded,
    onToggle,
    selectedStudentCount = 0,
}: PackageSectionProps) {
    const pathname = usePathname();
    const router = useRouter();
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage");
    const { refreshData } = useRegisterActions();
    const { form: contextForm, setForm: setContextForm } = usePackageFormState();
    const { setFormValidity } = useFormRegistration();

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formData, setFormData] = useState<PackageFormData>(contextForm || defaultPackageForm);

    // Update context when form data changes
    useEffect(() => {
        setContextForm(formData);
    }, [formData, setContextForm]);

    const isFormValid = useMemo(() => {
        const result = packageFormSchema.safeParse(formData);
        return result.success;
    }, [formData]);

    // Update form validity in context
    useEffect(() => {
        setFormValidity(isFormValid);
    }, [isFormValid, setFormValidity]);

    const title = selectedPackage
        ? (() => {
              const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === selectedPackage.categoryEquipment);
              const EquipmentIcon = equipmentConfig?.icon;

              return (
                  <div className="flex items-center gap-3">
                      <span>{selectedPackage.description}</span>
                      {EquipmentIcon && (
                          <EquipmentStudentCapacityBadge
                              categoryIcon={EquipmentIcon}
                              equipmentCapacity={selectedPackage.capacityEquipment}
                              studentCapacity={selectedPackage.capacityStudents}
                          />
                      )}
                  </div>
              );
          })()
        : "Select Package";

    const handleSubmit = useCallback(async () => {
        setSubmitLoading(true);
        await handleEntityCreation({
            isFormValid,
            entityName: "Package",
            createFn: () =>
                createSchoolPackage({
                    duration_minutes: formData.durationMinutes,
                    description: formData.description,
                    price_per_student: formData.pricePerStudent,
                    capacity_students: formData.capacityStudents,
                    capacity_equipment: formData.capacityEquipment,
                    category_equipment: formData.categoryEquipment,
                    package_type: formData.packageType,
                    is_public: formData.isPublic,
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
                    pathname,
                    entityId: data.id,
                    closeDialog: () => setIsDialogOpen(false),
                    onSelectId: () => onSelect(newPackage),
                    onRefresh: refreshData,
                    onAddToQueue: () => {},
                    setFormData,
                    defaultForm: defaultPackageForm,
                });
            },
            successMessage: `Package created: ${formData.description}`,
        });
        setSubmitLoading(false);
    }, [isFormValid, formData, onSelect, refreshData, pathname, router]);

    return (
        <>
            <Section
                id="package-section"
                title={title}
                isExpanded={isExpanded}
                onToggle={onToggle}
                entityIcon={packageEntity?.icon}
                entityColor={packageEntity?.color}
                hasSelection={selectedPackage !== null}
                onClear={() => {
                    onSelect(null as any);
                }}
                showAddButton={true}
                onAddClick={() => setIsDialogOpen(true)}
            >
                <PackageTable
                    packages={packages}
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
