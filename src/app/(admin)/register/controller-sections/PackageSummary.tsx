import type { PackageFormData } from "@/src/components/forms/Package4SchoolForm";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";

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
                    label="Package Type"
                    value={packageFormData.packageType ? typeLabels[packageFormData.packageType] : null}
                    placeholder="Select package type"
                />

                <SummaryItem
                    label="Category"
                    value={
                        categoryConfig ? (
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-5 h-5 flex items-center justify-center"
                                    style={{ color: categoryConfig.color }}
                                >
                                    {CategoryIcon && <CategoryIcon className="w-5 h-5" />}
                                </div>
                                <span>{categoryConfig.name}</span>
                            </div>
                        ) : null
                    }
                    placeholder="Select equipment category"
                />

                <SummaryItem
                    label="Duration"
                    value={packageFormData.durationMinutes > 0 ? formatDuration(packageFormData.durationMinutes) : null}
                    placeholder="Set duration"
                />

                <SummaryItem
                    label="Price"
                    value={packageFormData.pricePerStudent >= 0 ? `€${packageFormData.pricePerStudent}` : null}
                    placeholder="Set price per student"
                />

                <SummaryItem
                    label="Capacity"
                    value={
                        packageFormData.capacityStudents > 0 && packageFormData.capacityEquipment > 0
                            ? `${packageFormData.capacityStudents} students / ${packageFormData.capacityEquipment} equipment`
                            : null
                    }
                    placeholder="Set capacity limits"
                />

                <SummaryItem
                    label="Visibility"
                    value={packageFormData.isPublic ? "Public" : "Private"}
                    placeholder="Set visibility"
                />
            </div>
        </div>
    );
}

function SummaryItem({ label, value, placeholder }: { label: string; value: string | React.ReactNode | null; placeholder: string }) {
    const isComplete = !!value;

    return (
        <div
            className={`p-3 rounded-lg border ${
                isComplete
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-muted/30 border-border"
            }`}
        >
            <div className="text-xs text-muted-foreground mb-1">
                {isComplete ? `✓ ${label}` : `⚠ ${label} Required`}
            </div>
            {isComplete ? (
                <div className="text-sm">{value}</div>
            ) : (
                <div className="text-xs text-muted-foreground">{placeholder}</div>
            )}
        </div>
    );
}
