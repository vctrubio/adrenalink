"use client";

import { Pencil } from "lucide-react";
import type { BaseStepProps, SummaryField } from "./types";

interface MultiStepSummaryProps extends BaseStepProps {
    fields: SummaryField[];
    onEditField?: (fieldKey: string) => void;
    gridCols?: number;
}

export function MultiStepSummary({ formMethods, fields, onEditField, gridCols = 2 }: MultiStepSummaryProps) {
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
                    const isEmpty = isFieldEmpty(field);

                    return (
                        <div
                            key={field.key}
                            className={`
                                group relative p-5 rounded-2xl border transition-all duration-200
                                ${isEmpty 
                                    ? "bg-orange-50/50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800" 
                                    : "bg-zinc-50/50 border-zinc-100 hover:border-zinc-300 hover:shadow-md hover:bg-white dark:bg-zinc-900/50 dark:border-zinc-800 dark:hover:border-zinc-700"}
                                ${field.colSpan === 2 ? `md:col-span-${gridCols}` : ""}
                            `}
                        >
                            {isEditable && onEditField && (
                                <button
                                    type="button"
                                    aria-label={`Edit ${field.label}`}
                                    onClick={() => onEditField(field.key)}
                                    className="absolute top-3 right-3 p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <div className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 mb-1.5">{field.label}</div>
                            <div className={`text-base font-semibold pr-6 break-words ${isEmpty ? "text-orange-600 dark:text-orange-400 italic" : "text-zinc-900 dark:text-zinc-100"}`}>
                                {isEmpty ? "Not provided" : displayValue}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
