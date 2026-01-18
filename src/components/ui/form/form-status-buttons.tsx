"use client";

import { forwardRef } from "react";
import { BOOKING_STATUS_CONFIG, type BookingStatus } from "@/types/status";

interface FormStatusButtonsProps {
    value: BookingStatus;
    onChange: (status: BookingStatus) => void;
    disabled?: boolean;
}

const STATUS_OPTIONS: BookingStatus[] = ["active", "completed", "uncompleted"];

const FormStatusButtons = forwardRef<HTMLDivElement, FormStatusButtonsProps>(
    ({ value, onChange, disabled = false }, ref) => {
        return (
            <div ref={ref} className="flex gap-2">
                {STATUS_OPTIONS.map((status) => {
                    const config = BOOKING_STATUS_CONFIG[status];
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

FormStatusButtons.displayName = "FormStatusButtons";

export default FormStatusButtons;
