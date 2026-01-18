"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface FormSubmitProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    color?: string;
    entityId?: string;
    isSubmitting?: boolean;
    children: React.ReactNode;
}

const FormSubmit = forwardRef<HTMLButtonElement, FormSubmitProps>(({ className = "", color, entityId, isSubmitting, children, ...props }, ref) => {
    const bgStyle = color ? { backgroundColor: color } : {};

    return (
        <button
            ref={ref}
            type="submit"
            disabled={isSubmitting || props.disabled}
            className={`
          px-4 py-2 text-base rounded-md font-medium transition-all duration-200
          ${color ? "text-white hover:shadow-lg" : "bg-transparent border border-secondary text-foreground hover:bg-accent"}
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
            style={color ? bgStyle : {}}
            onMouseEnter={(e) => {
                if (color && !isSubmitting) {
                    e.currentTarget.style.backgroundColor = `${color}dd`;
                }
            }}
            onMouseLeave={(e) => {
                if (color && !isSubmitting) {
                    e.currentTarget.style.backgroundColor = color;
                }
            }}
            {...props}
        >
            {children}
        </button>
    );
});

FormSubmit.displayName = "FormSubmit";

export default FormSubmit;
