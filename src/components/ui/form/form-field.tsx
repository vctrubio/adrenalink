"use client";

import { ReactNode } from "react";
import { BadgeCheck } from "lucide-react";

interface FormFieldProps {
    label: string;
    children: ReactNode;
    required?: boolean;
    error?: string;
    className?: string;
    isValid?: boolean;
}

export default function FormField({ label, children, required = false, error, className = "", isValid = false }: FormFieldProps) {
    // Don't show error messages - the red asterisk and green checkmark are enough
    return (
        <div className={`space-y-3 mb-6 ${className}`}>
            <label className="block text-sm font-medium text-foreground flex items-center">
                {label}
                {required && !isValid && <span className="text-destructive ml-1">*</span>}
                {required && isValid && <BadgeCheck className="w-4 h-4 text-secondary ml-1" />}
            </label>
            {children}
        </div>
    );
}
