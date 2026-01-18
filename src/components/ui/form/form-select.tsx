"use client";

import { forwardRef, SelectHTMLAttributes } from "react";

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string; label: string }[];
    error?: boolean;
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(({ className = "", error = false, options, ...props }, ref) => {
    return (
        <select
            ref={ref}
            className={`
          w-full h-10 px-3 rounded-lg border transition-colors text-sm
          bg-background text-foreground
          ${error ? "border-destructive focus:ring-destructive" : "border-input focus:ring-ring focus:border-ring"}
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
            {...props}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
});

FormSelect.displayName = "FormSelect";

export default FormSelect;
