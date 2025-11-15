import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { PackageTable } from "@/src/components/tables/PackageTable";

interface Package {
    id: string;
    description: string;
    durationMinutes: number;
    pricePerStudent: number;
    capacityStudents: number;
    capacityEquipment: number;
    categoryEquipment: string;
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
        ? `${selectedPackage.description}` 
        : "Select Package";

    return (
        <Section
            id="package-section"
            title={title}
            isExpanded={isExpanded}
            onToggle={onToggle}
            entityIcon={packageEntity?.icon}
            entityColor={packageEntity?.color}
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
