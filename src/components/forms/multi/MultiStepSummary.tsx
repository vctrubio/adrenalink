"use client";

import { Pencil } from "lucide-react";
import type { BaseStepProps, SummaryField } from "./types";

interface MultiStepSummaryProps extends BaseStepProps {
    fields: SummaryField[];
    onEditField?: (fieldKey: string) => void;
    gridCols?: number;
}

export function MultiStepSummary({ 
    formMethods, 
    fields, 
    onEditField,
    gridCols = 2 
}: MultiStepSummaryProps) {
    const { watch } = formMethods;
    const values = watch();

    const getDisplayValue = (field: SummaryField): string => {
        if (field.displayValue) return field.displayValue;
        
        const value = values[field.key];
        
        // Handle different value types
        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(", ") : "—";
        }
        
        if (typeof value === "boolean") {
            return value ? "Yes" : "No";
        }
        
        if (value === null || value === undefined || value === "") {
            return "—";
        }
        
        return String(value);
    };

    const isFieldEmpty = (field: SummaryField): boolean => {
        const value = values[field.key];
        
        if (Array.isArray(value)) {
            return value.length === 0;
        }
        
        return value === null || value === undefined || value === "";
    };

    return (
        <div className="space-y-6">
            <div className={`grid grid-cols-1 ${gridCols === 2 ? "md:grid-cols-2" : `md:grid-cols-${gridCols}`} gap-4`}>
                {fields.map((field) => {
                    const displayValue = getDisplayValue(field);
                    const isEditable = field.editable !== false; // Default to editable
                    
                    return (
                        <div 
                            key={field.key}
                            className={`relative p-4 rounded-md border bg-background ${field.colSpan === 2 ? `md:col-span-${gridCols}` : ""} ${isFieldEmpty(field) ? "border-orange-400 border-2" : "border-border"}`}
                        >
                            {isEditable && onEditField && (
                                <button 
                                    type="button" 
                                    aria-label={`Edit ${field.label}`}
                                    onClick={() => onEditField(field.key)} 
                                    className="absolute top-2 right-2 p-1 rounded hover:bg-accent transition-colors"
                                >
                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                </button>
                            )}
                            <div className="text-xs text-muted-foreground mb-1">{field.label}</div>
                            <div className="font-medium pr-8">{displayValue}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}