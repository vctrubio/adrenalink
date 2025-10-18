"use client";

import { ReactNode, ButtonHTMLAttributes, forwardRef } from "react";
import { LucideIcon, Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "tertiary" | "fourth" | "fifth" | "success" | "warning" | "danger" | "ghost" | "outline";
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    loading?: boolean;
    loadingText?: string;
    icon?: LucideIcon;
    iconPosition?: "left" | "right";
    fullWidth?: boolean;
    rounded?: "none" | "sm" | "md" | "lg" | "full";
    children?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = "primary", size = "md", loading = false, loadingText, icon: Icon, iconPosition = "left", fullWidth = false, rounded = "md", className = "", disabled, children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
        primary: "bg-primary text-white hover:bg-primary/90 focus:ring-primary/50 shadow-sm hover:shadow-md",
        secondary: "bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/50 shadow-sm hover:shadow-md",
        tertiary: "bg-tertiary text-white hover:bg-tertiary/90 focus:ring-tertiary/50 shadow-sm hover:shadow-md",
        fourth: "bg-fourth text-white hover:bg-fourth/90 focus:ring-fourth/50 shadow-sm hover:shadow-md",
        fifth: "bg-fifth text-white hover:bg-fifth/90 focus:ring-fifth/50 shadow-sm hover:shadow-md",
        success: "bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/50 shadow-sm hover:shadow-md",
        warning: "bg-warning text-white hover:bg-warning/90 focus:ring-warning/50 shadow-sm hover:shadow-md",
        danger: "bg-destructive text-white hover:bg-destructive/90 focus:ring-destructive/50 shadow-sm hover:shadow-md",
        ghost: "text-foreground hover:bg-accent focus:ring-primary/50 hover:text-primary",
        outline: "border border-border text-foreground hover:bg-accent focus:ring-primary/50 hover:border-primary/50",
    };

    const sizeClasses = {
        xs: "px-2 py-1 text-xs gap-1",
        sm: "px-3 py-1.5 text-sm gap-1.5",
        md: "px-4 py-2 text-sm gap-2",
        lg: "px-6 py-3 text-base gap-2",
        xl: "px-8 py-4 text-lg gap-3",
    };

    const iconSizes = {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
    };

    const roundedClasses = {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-lg",
        lg: "rounded-xl",
        full: "rounded-full",
    };

    const widthClass = fullWidth ? "w-full" : "";

    const combinedClasses = `
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${roundedClasses[rounded]}
        ${widthClass}
        ${className}
    `.trim();

    const iconSize = iconSizes[size];
    const showIcon = Icon && !loading;
    const showLoading = loading;

    return (
        <button ref={ref} className={combinedClasses} disabled={disabled || loading} {...props}>
            {showLoading && <Loader2 size={iconSize} className="animate-spin" />}
            {showIcon && iconPosition === "left" && <Icon size={iconSize} />}
            <span>{loading && loadingText ? loadingText : children}</span>
            {showIcon && iconPosition === "right" && <Icon size={iconSize} />}
        </button>
    );
});

Button.displayName = "Button";

export default Button;
