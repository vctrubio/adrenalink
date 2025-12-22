import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { PackageTable } from "@/src/components/tables/PackageTable";
import { EquipmentStudentCapacityBadge } from "@/src/components/ui/badge";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";

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

    return (
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
        >
            <PackageTable
                packages={packages}
                selectedPackage={selectedPackage}
                onSelect={onSelect}
                selectedStudentCount={selectedStudentCount}
            />
        </Section>
    );
}
