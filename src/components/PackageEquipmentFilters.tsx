"use client";

import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { useTablesController } from "@/src/app/(admin)/(tables)/layout";

/**
 * CONFIG & TYPES
 * Shared filtering logic for both Tables and Dashboard
 */

export interface FilterablePackage {
    packageType: string;
    categoryEquipment: string;
}

export function filterByStatus(item: FilterablePackage, status: string): boolean {
    if (status === "All") return true;

    const selectedOptions = status.split(",").filter((s) => s);

    // Check package type filter
    const packageTypeFilters = selectedOptions.filter((s) => s === "Lesson" || s === "Rental");
    if (packageTypeFilters.length > 0) {
        const matchesPackageType = packageTypeFilters.some(
            (type) =>
                (type === "Lesson" && item.packageType?.toLowerCase() === "lessons") || 
                (type === "Rental" && item.packageType?.toLowerCase() === "rental"),
        );
        if (!matchesPackageType) return false;
    }

    // Check equipment category filter
    const equipmentFilters = selectedOptions.filter((s) => ["Kite", "Wing", "Windsurf"].includes(s));
    if (equipmentFilters.length > 0) {
        const categoryMap = { Kite: "kite", Wing: "wing", Windsurf: "windsurf" };
        const matchesEquipment = equipmentFilters.some(
            (cat) => item.categoryEquipment?.toLowerCase() === categoryMap[cat as keyof typeof categoryMap],
        );
        if (!matchesEquipment) return false;
    }

    return true;
}

/**
 * COMPONENT
 * Specialized filter buttons for Package/Equipment context
 */

export function PackageEquipmentFilters() {
    const { status, setStatus } = useTablesController();
    const options = ["All", "Lesson", "Rental", "Kite", "Wing", "Windsurf"];
    
    const selectedValues = status !== "All" ? status.split(',').filter(v => v) : ["All"];

    const getOptionContent = (option: string) => {
        const equipmentCategory = EQUIPMENT_CATEGORIES.find(cat => cat.name === option);
        if (equipmentCategory) {
            const Icon = equipmentCategory.icon;
            return <Icon size={14} />;
        }
        return option;
    };

    const handleOptionClick = (option: string) => {
        if (option === "All") {
            setStatus("All");
            return;
        }

        let newSelected = [...selectedValues];
        
        if (option === "Lesson" || option === "Rental") {
            newSelected = newSelected.filter(v => v !== "Lesson" && v !== "Rental" && v !== "All");
            if (!selectedValues.includes(option)) {
                newSelected.push(option);
            }
        } else {
            if (newSelected.includes(option)) {
                newSelected = newSelected.filter(v => v !== option);
            } else {
                newSelected.push(option);
            }
            newSelected = newSelected.filter(v => v !== "All");
        }

        if (newSelected.length === 0) {
            setStatus("All");
        } else {
            setStatus(newSelected.join(','));
        }
    };

    const isSelected = (option: string) => {
        if (status === "All") return option === "All";
        return selectedValues.includes(option);
    };

    return (
        <div className="flex items-center bg-muted/30 rounded-xl border border-border/50 p-1">
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase transition-all rounded-lg ${
                        isSelected(option)
                            ? "bg-background shadow-sm text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    title={option}
                >
                    {getOptionContent(option)}
                </button>
            ))}
        </div>
    );
}
