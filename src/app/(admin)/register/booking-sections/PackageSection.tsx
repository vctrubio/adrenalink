"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { PackageTable } from "@/src/components/tables/PackageTable";
import { EquipmentStudentCapacityBadge } from "@/src/components/ui/badge";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EntityAddDialog } from "@/src/components/ui/EntityAddDialog";
import Package4SchoolForm, { packageFormSchema, type PackageFormData } from "@/src/components/forms/Package4SchoolForm";
import { createAndLinkPackage } from "@/actions/register-action";
import { useRegisterActions } from "../RegisterContext";

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
    selectedStudentCount = 0
}: PackageSectionProps) {
    const packageEntity = ENTITY_DATA.find(e => e.id === "schoolPackage");
    const pathname = usePathname();
    const router = useRouter();
    const { addPackage } = useRegisterActions();

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<PackageFormData>({
        durationMinutes: 60,
        description: "",
        pricePerStudent: 0,
        capacityStudents: 1,
        capacityEquipment: 1,
        categoryEquipment: "kite",
        packageType: "lessons",
        isPublic: false,
    });

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

    const handleSubmit = async () => {
        const validation = packageFormSchema.safeParse(formData);
        if (!validation.success) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            const result = await createAndLinkPackage({
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

            // Optimistic update to data
            const newPackage = {
                id: result.data.package.id,
                description: result.data.package.description,
                durationMinutes: result.data.package.durationMinutes,
                pricePerStudent: result.data.package.pricePerStudent,
                capacityStudents: result.data.package.capacityStudents,
                capacityEquipment: result.data.package.capacityEquipment,
                categoryEquipment: result.data.package.categoryEquipment,
                isPublic: result.data.package.isPublic,
            };
            addPackage(newPackage);

            // Behavior depends on current route
            if (pathname === "/register") {
                // On booking form: close dialog, navigate with param
                setIsDialogOpen(false);
                router.push(`/register?add=package:${result.data.package.id}`);
            } else {
                // On /register/package: keep dialog open, reset form
                setFormData({
                    durationMinutes: 60,
                    description: "",
                    pricePerStudent: 0,
                    capacityStudents: 1,
                    capacityEquipment: 1,
                    categoryEquipment: "kite",
                    packageType: "lessons",
                    isPublic: false,
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
                    isFormReady={packageFormSchema.safeParse(formData).success}
                />

                {/* Submit button */}
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !packageFormSchema.safeParse(formData).success}
                        className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Creating..." : "Add Package"}
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
