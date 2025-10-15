"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "fourth" | "fifth" | "destructive";
  size?: "sm" | "md" | "lg";
}

export default function FormButton({
    children,
    variant = "primary",
    size = "md",
    className = "",
    disabled,
    ...props
}: FormButtonProps) {
    const baseClasses = "font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary",
        tertiary: "bg-tertiary text-tertiary-foreground hover:bg-tertiary/90 focus:ring-tertiary",
        fourth: "bg-fourth text-fourth-foreground hover:bg-fourth/90 focus:ring-fourth",
        fifth: "bg-fifth text-fifth-foreground hover:bg-fifth/90 focus:ring-fifth",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
