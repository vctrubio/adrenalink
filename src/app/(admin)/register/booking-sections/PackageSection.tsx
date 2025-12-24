"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { PackageTable } from "@/src/components/tables/PackageTable";
import { EquipmentStudentCapacityBadge } from "@/src/components/ui/badge";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EntityAddDialog } from "@/src/components/ui/EntityAddDialog";
import Package4SchoolForm, { packageFormSchema, type PackageFormData } from "@/src/components/forms/school/Package4SchoolForm";
import { createSchoolPackage } from "@/actions/register-action";
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
    selectedStudentCount?: number;
}

const defaultPackageForm: PackageFormData = {
    durationMinutes: 60,
    description: "",
    pricePerStudent: 0,
    capacityStudents: 1,
    capacityEquipment: 1,
    categoryEquipment: "" as any,
    packageType: "" as any,
    isPublic: true,
};

export function PackageSection({
    packages,
    selectedPackage,
    onSelect,
    isExpanded,
    onToggle,
    selectedStudentCount = 0
}: PackageSectionProps) {
    const packageEntity = ENTITY_DATA.find(e => e.id === "schoolPackage");
    const { refreshData } = useRegisterActions();
    const { form: contextForm, setForm: setContextForm } = usePackageFormState();
    const { setFormValidity } = useFormRegistration();

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
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
            const equipmentConfig = EQUIPMENT_CATEGORIES.find(
                (cat) => cat.id === selectedPackage.categoryEquipment
            );
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
        if (!isFormValid) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            const result = await createSchoolPackage({
                durationMinutes: formData.durationMinutes,
                description: formData.description,
                pricePerStudent: formData.pricePerStudent,
                capacityStudents: formData.capacityStudents,
                capacityEquipment: formData.capacityEquipment,
                categoryEquipment: formData.categoryEquipment,
                packageType: formData.packageType,
                isPublic: formData.isPublic,
            });

            if (!result.success) {
                toast.error(result.error || "Failed to create package");
                setLoading(false);
                return;
            }

            const newPackage = {
                id: result.data.id,
                description: result.data.description,
                durationMinutes: result.data.durationMinutes,
                pricePerStudent: result.data.pricePerStudent,
                capacityStudents: result.data.capacityStudents,
                capacityEquipment: result.data.capacityEquipment,
                categoryEquipment: result.data.categoryEquipment,
                isPublic: result.data.isPublic,
            };

            // Add to queue with full package data for rendering
            addToQueue("packages", {
                id: result.data.id,
                name: formData.description,
                timestamp: Date.now(),
                type: "package",
                metadata: newPackage,
            });

            // Refresh data to get the newly created package in the list
            await refreshData();

            // Select the newly created package
            onSelect(newPackage);

            // Close dialog and reset form
            setIsDialogOpen(false);
            setFormData(defaultPackageForm);

            setLoading(false);
        } catch (error) {
            console.error("Package creation error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(errorMessage);
            setLoading(false);
        }
    }, [isFormValid, formData, onSelect, refreshData]);

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

            <EntityAddDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            >
                <Package4SchoolForm
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
