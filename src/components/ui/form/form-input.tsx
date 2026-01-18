"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({ className = "", error = false, ...props }, ref) => {
    return (
        <input
            ref={ref}
            className={`
          w-full h-10 px-3 rounded-lg border transition-colors text-sm
          bg-background text-foreground
          ${error ? "border-destructive/50 focus:ring-destructive/20" : "border-input focus:border-ring"}
          focus:outline-none focus:ring-2 focus:ring-opacity-20
          placeholder:text-muted-foreground
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
            {...props}
        />
    );
});

FormInput.displayName = "FormInput";

export default FormInput;
