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
          w-full px-3 py-2 rounded-md border transition-colors
          bg-background text-foreground
          ${error ? "border-black focus:ring-black" : "border-input focus:ring-ring focus:border-ring"}
          focus:outline-none focus:ring-2 focus:ring-opacity-50
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
