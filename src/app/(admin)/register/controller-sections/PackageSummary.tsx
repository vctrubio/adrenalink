import type { PackageFormData } from "@/src/components/forms/Package4SchoolForm";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EquipmentStudentCapacityBadge } from "@/src/components/ui/badge";
import { FORM_SUMMARY_COLORS } from "@/types/form-summary";

interface PackageSummaryProps {
    packageFormData: PackageFormData;
}

export function PackageSummary({ packageFormData }: PackageSummaryProps) {
    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} minutes`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const typeLabels = {
        lessons: "Lessons",
        rental: "Rental",
    };

    // Get the equipment category details
    const categoryConfig = EQUIPMENT_CATEGORIES.find(
        (cat) => cat.id === packageFormData.categoryEquipment
    );
    const CategoryIcon = categoryConfig?.icon;

    return (
        <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Package Summary</h3>

            <div className="space-y-2">
                <SummaryItem
                    label="Description"
                    value={packageFormData.description || null}
                    placeholder="Enter package description"
                    isRequired={true}
                />

                <SummaryItem
                    label="Package Type"
                    value={packageFormData.packageType ? typeLabels[packageFormData.packageType] : null}
                    placeholder="Select package type"
                    isRequired={true}
                />

                <SummaryItem
                    label="Capacity"
                    value={
                        packageFormData.capacityStudents > 0 && packageFormData.capacityEquipment > 0 && CategoryIcon
                            ? (
                                <EquipmentStudentCapacityBadge
                                    categoryIcon={CategoryIcon}
                                    equipmentCapacity={packageFormData.capacityEquipment}
                                    studentCapacity={packageFormData.capacityStudents}
                                />
                            )
                            : null
                    }
                    placeholder="Set capacity limits"
                    isRequired={true}
                />

                <SummaryItem
                    label="Duration"
                    value={packageFormData.durationMinutes > 0 ? formatDuration(packageFormData.durationMinutes) : null}
                    placeholder="Set duration"
                    isRequired={true}
                />

                <SummaryItem
                    label="Price"
                    value={packageFormData.pricePerStudent >= 0 ? `€${packageFormData.pricePerStudent}` : null}
                    placeholder="Set price per student"
                    isRequired={true}
                />

                <SummaryItem
                    label="Visibility"
                    value={packageFormData.isPublic ? "Public" : "Private"}
                    placeholder="Set visibility"
                    isRequired={true}
                />
            </div>
        </div>
    );
}

function SummaryItem({
    label,
    value,
    placeholder,
    isRequired = true,
}: {
    label: string;
    value: string | React.ReactNode | null;
    placeholder: string;
    isRequired?: boolean;
}) {
    const isComplete = !!value;

    // Use required colors for completed required fields, otherwise use optional colors if not required
    const colors = isComplete
        ? FORM_SUMMARY_COLORS.required
        : isRequired
            ? FORM_SUMMARY_COLORS.required
            : FORM_SUMMARY_COLORS.optional;

    return (
        <div className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
            <div className="text-xs text-muted-foreground mb-1">
                {isComplete
                    ? `✓ ${label}`
                    : isRequired
                        ? `⚠ ${label} Required`
                        : `${label}`}
            </div>
            {isComplete ? (
                <div className="text-sm">{value}</div>
            ) : (
                <div className="text-xs text-muted-foreground">{placeholder}</div>
            )}
        </div>
    );
}
