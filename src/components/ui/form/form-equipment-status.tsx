"use client";

import { forwardRef } from "react";
import { EQUIPMENT_STATUS_CONFIG, type EquipmentStatus } from "@/types/status";

interface FormEquipmentStatusProps {
    value: EquipmentStatus;
    onChange: (status: EquipmentStatus) => void;
    disabled?: boolean;
}

const STATUS_OPTIONS: EquipmentStatus[] = ["rental", "public", "selling", "sold", "inrepair", "rip"];

const FormEquipmentStatus = forwardRef<HTMLDivElement, FormEquipmentStatusProps>(
    ({ value, onChange, disabled = false }, ref) => {
        return (
            <div ref={ref} className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => {
                    const config = EQUIPMENT_STATUS_CONFIG[status];
                    const isSelected = value === status;

                    return (
                        <button
                            key={status}
                            type="button"
                            onClick={() => !disabled && onChange(status)}
                            disabled={disabled}
                            className={`
                                px-4 py-2 text-sm font-medium rounded-lg border transition-all
                                ${
                                    isSelected
                                        ? "bg-foreground/10 border-foreground/30 text-foreground"
                                        : "bg-background text-foreground border-input hover:bg-muted/50"
                                }
                                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                            `}
                        >
                            {config.label}
                        </button>
                    );
                })}
            </div>
        );
    },
);

FormEquipmentStatus.displayName = "FormEquipmentStatus";

export default FormEquipmentStatus;
