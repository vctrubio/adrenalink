import React from "react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    entityColor?: string;
    variant?: "card" | "background";
}

export function SearchInput({ entityColor, className, placeholder = "Search...", variant = "card", ...props }: SearchInputProps) {
    const bgClass = variant === "background" ? "bg-background" : "bg-card";

    return (
        <input
            type="text"
            placeholder={placeholder}
            className={`w-full px-4 py-2.5 rounded-lg border border-border ${bgClass} text-foreground placeholder:text-muted-foreground focus:outline-none transition-all focus:bg-background ${className || ""}`}
            onFocus={(e) => {
                if (entityColor) {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${entityColor}40`;
                }
                props.onFocus?.(e);
            }}
            onBlur={(e) => {
                e.currentTarget.style.boxShadow = "";
                props.onBlur?.(e);
            }}
            {...props}
        />
    );
}
