"use client";

import { EQUIPMENT_CATEGORIES } from "@/config/equipment";

interface StatusFilterButtonsProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    entityId?: string;
}

export function StatusFilterButtons({ options, value, onChange, entityId }: StatusFilterButtonsProps) {
    const isMultiSelect = entityId === "schoolPackage";
    const selectedValues = isMultiSelect && value !== "All" ? value.split(',').filter(v => v) : value === "All" ? ["All"] : [value];

    const getOptionContent = (option: string) => {
        if (entityId === "schoolPackage") {
            const equipmentCategory = EQUIPMENT_CATEGORIES.find(cat => cat.name === option);
            if (equipmentCategory) {
                const Icon = equipmentCategory.icon;
                return <Icon className="w-4 h-4" />;
            }
        }
        return option;
    };

    const handleOptionClick = (option: string) => {
        if (!isMultiSelect) {
            onChange(option);
            return;
        }

        if (option === "All") {
            onChange("All");
            return;
        }

        let newSelected = [...selectedValues];
        
        // Handle package type selection (single select - only one of Lesson/Rental)
        if (option === "Lesson" || option === "Rental") {
            // Remove any existing package type
            newSelected = newSelected.filter(v => v !== "Lesson" && v !== "Rental" && v !== "All");
            if (!newSelected.includes(option)) {
                newSelected.push(option);
            } else {
                // If clicking the same package type, remove it
                newSelected = newSelected.filter(v => v !== option);
            }
        } else {
            // Handle equipment category selection (multi select)
            if (newSelected.includes(option)) {
                newSelected = newSelected.filter(v => v !== option);
            } else {
                newSelected.push(option);
            }
            // Remove "All" when selecting specific equipment
            newSelected = newSelected.filter(v => v !== "All");
        }

        // If nothing is selected, default to "All"
        if (newSelected.length === 0) {
            onChange("All");
        } else {
            onChange(newSelected.join(','));
        }
    };

    const isSelected = (option: string) => {
        if (!isMultiSelect) return value === option;
        if (value === "All") return option === "All";
        return selectedValues.includes(option);
    };

    return (
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
            {options.map((option, index) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    className={`px-3 py-2 text-xs font-semibold transition-colors ${
                        index > 0 ? "border-l border-border" : ""
                    } ${
                        isSelected(option)
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                    title={option}
                >
                    {getOptionContent(option)}
                </button>
            ))}
        </div>
    );
}
