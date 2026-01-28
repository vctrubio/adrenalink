"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(({ className = "", error = false, ...props }, ref) => {
    return (
        <textarea
            ref={ref}
            className={`
          w-full px-3 py-2 rounded-lg border transition-all text-sm
          bg-background text-foreground
          ${error ? "border-destructive/50 focus:border-destructive" : "border-input focus:border-foreground dark:focus:border-white"}
          focus:outline-none focus:ring-0 focus:ring-offset-0
          placeholder:text-muted-foreground
          disabled:opacity-50 disabled:cursor-not-allowed
          min-h-[80px] resize-none
          ${className}
        `}
            {...props}
        />
    );
});

FormTextarea.displayName = "FormTextarea";

export default FormTextarea;
