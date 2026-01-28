"use client";

import { forwardRef, useState, useCallback, useMemo } from "react";
import FormInput from "./form-input";
import { Plus, X } from "lucide-react";

export interface Option {
    value: string;
    label: string;
}

interface FormMultiSelectProps {
    options: (string | Option)[];
    value: string | string[] | undefined;
    onChange: (value: any) => void;
    disabled?: boolean;
    multi?: boolean;
    allowCustom?: boolean;
    customLabel?: string;
    placeholder?: string;
}

const FormMultiSelect = forwardRef<HTMLDivElement, FormMultiSelectProps>(
    (
        {
            options,
            value,
            onChange,
            disabled = false,
            multi = true,
            allowCustom = false,
            customLabel = "Other",
            placeholder = "Enter value",
        },
        ref,
    ) => {
        const [customValue, setCustomValue] = useState("");
        const [showCustomInput, setShowCustomInput] = useState(false);

        // Normalize value to array for easier handling
        const selectedValues = useMemo(() => {
            if (value === undefined || value === null) return [];
            return Array.isArray(value) ? value : [value];
        }, [value]);

        // Normalize options to objects
        const normalizedOptions = useMemo(() => {
            return options.map((opt) => (typeof opt === "string" ? { value: opt, label: opt } : opt));
        }, [options]);

        const standardValues = normalizedOptions.map((o) => o.value);
        const customValues = selectedValues.filter((v) => !standardValues.includes(v));

        const handleToggle = useCallback(
            (optionValue: string) => {
                if (disabled) return;

                if (multi) {
                    if (selectedValues.includes(optionValue)) {
                        onChange(selectedValues.filter((v) => v !== optionValue));
                    } else {
                        onChange([...selectedValues, optionValue]);
                    }
                } else {
                    // Single select: toggle off if already selected, or switch to new value
                    if (selectedValues.includes(optionValue)) {
                         // Optional: allow deselecting in single mode? Usually yes for "status" type things if not required.
                         // But if required, we might not want to allow empty.
                         // For now, let's assume it behaves like a radio button that can be unset if needed, or controlled by parent.
                         // Actually, for single select "buttons", clicking active one usually does nothing or deselects.
                         // Let's implement deselect for flexibility.
                         // onChange(undefined); // Or empty string?
                         // Let's just keep it simple: always select.
                         onChange(optionValue);
                    } else {
                        onChange(optionValue);
                    }
                }
            },
            [selectedValues, multi, onChange, disabled],
        );

        const handleAddCustom = useCallback(() => {
            if (customValue.trim() && !selectedValues.includes(customValue.trim())) {
                const newValue = customValue.trim();
                if (multi) {
                    onChange([...selectedValues, newValue]);
                } else {
                    onChange(newValue);
                }
                setCustomValue("");
                setShowCustomInput(false);
            }
        }, [customValue, selectedValues, multi, onChange]);

        const handleRemoveCustom = useCallback(
            (val: string) => {
                if (disabled) return;
                if (multi) {
                    onChange(selectedValues.filter((v) => v !== val));
                } else {
                    onChange(undefined);
                }
            },
            [selectedValues, multi, onChange, disabled],
        );

        const buttonBaseClass =
            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border";
        const activeClass =
            "bg-selection text-foreground border-selection-border shadow-sm";
        const inactiveClass =
            "bg-muted/10 text-muted-foreground border-border hover:border-zinc-200 dark:hover:border-zinc-700";

        return (
            <div ref={ref} className="space-y-3">
                <div className="flex flex-wrap gap-2">
                    {normalizedOptions.map((option) => {
                        const isSelected = selectedValues.includes(option.value);
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleToggle(option.value)}
                                disabled={disabled}
                                className={`${buttonBaseClass} ${isSelected ? activeClass : inactiveClass} ${
                                    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}

                    {allowCustom && (
                        <button
                            type="button"
                            onClick={() => setShowCustomInput(!showCustomInput)}
                            disabled={disabled}
                            className={`${buttonBaseClass} ${
                                showCustomInput ? activeClass : inactiveClass
                            } flex items-center gap-1 ${
                                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                            }`}
                        >
                            {customLabel} <Plus size={12} />
                        </button>
                    )}
                </div>

                {showCustomInput && (
                    <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <FormInput
                            type="text"
                            value={customValue}
                            onChange={(e) => setCustomValue(e.target.value)}
                            placeholder={placeholder}
                            disabled={disabled}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddCustom();
                                }
                            }}
                            className="h-9 text-xs"
                        />
                        <button
                            type="button"
                            onClick={handleAddCustom}
                            disabled={!customValue.trim() || disabled}
                            className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            ADD
                        </button>
                    </div>
                )}

                {/* Custom values display (only for multi, or if single and custom is selected but not in options) */}
                {customValues.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {customValues.map((val) => (
                            <div
                                key={val}
                                className={`${buttonBaseClass} ${activeClass} flex items-center gap-2 pr-2 cursor-default`}
                            >
                                {val}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveCustom(val)}
                                    disabled={disabled}
                                    className="hover:text-destructive transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    },
);

FormMultiSelect.displayName = "FormMultiSelect";

export default FormMultiSelect;
