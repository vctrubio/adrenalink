"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { LucideIcon, Loader2 } from "lucide-react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: LucideIcon;
    variant?: "primary" | "secondary" | "tertiary" | "fourth" | "fifth" | "success" | "warning" | "danger" | "ghost" | "outline";
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    loading?: boolean;
    rounded?: "none" | "sm" | "md" | "lg" | "full";
    tooltip?: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
    icon: Icon,
    variant = "ghost",
    size = "md",
    loading = false,
    rounded = "md",
    tooltip,
    className = "",
    disabled,
    ...props
}, ref) => {
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
        ghost: "text-muted-foreground hover:text-foreground hover:bg-accent focus:ring-primary/50",
        outline: "border border-border text-foreground hover:bg-accent focus:ring-primary/50 hover:border-primary/50"
    };

    const sizeClasses = {
        xs: "w-6 h-6",
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
        xl: "w-14 h-14"
    };

    const iconSizes = {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20
    };

    const roundedClasses = {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-lg",
        lg: "rounded-xl",
        full: "rounded-full"
    };

    const combinedClasses = `
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${roundedClasses[rounded]}
        ${className}
    `.trim();

    const iconSize = iconSizes[size];

    return (
        <button
            ref={ref}
            className={combinedClasses}
            disabled={disabled || loading}
            title={tooltip}
            aria-label={tooltip}
            {...props}
        >
            {loading ? (
                <Loader2 size={iconSize} className="animate-spin" />
            ) : (
                <Icon size={iconSize} />
            )}
        </button>
    );
});

IconButton.displayName = "IconButton";

export default IconButton;