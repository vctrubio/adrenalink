import React from "react";
import { X } from "lucide-react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    entityColor?: string;
    variant?: "card" | "background";
}

export function SearchInput({ entityColor, className, placeholder = "Search...", variant = "card", ...props }: SearchInputProps) {
    const bgClass = variant === "background" ? "bg-background" : "bg-card";
    const hasValue = props.value !== undefined && props.value !== "";

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (props.onChange) {
            // Create a synthetic event compatible with React.ChangeEvent<HTMLInputElement>
            const nativeEvent = new Event("change", { bubbles: true });
            const target = document.createElement("input");
            target.value = "";

            const syntheticEvent = {
                ...nativeEvent,
                target: target,
                currentTarget: target,
                preventDefault: () => {},
                stopPropagation: () => {},
                nativeEvent: nativeEvent,
                type: "change",
            } as unknown as React.ChangeEvent<HTMLInputElement>;

            props.onChange(syntheticEvent);
        }
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 rounded-lg border border-border ${bgClass} text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-transparent transition-all focus:bg-background pr-10 ${className || ""}`}
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
            {hasValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/50 transition-colors opacity-70 hover:opacity-100"
                    style={{ color: entityColor }}
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}
