"use client";

import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { getCompactNumber } from "@/getters/integer-getter";

interface CommissionTypeValueProps {
    value: string | number;
    type: "fixed" | "percentage";
    description?: string | null;
    onClick?: (e?: React.MouseEvent) => void;
    isSelected?: boolean;
    as?: React.ElementType;
    className?: string;
}

export function CommissionTypeValue({
    value,
    type,
    description,
    onClick,
    isSelected,
    as: Component = "button",
    className = "",
}: CommissionTypeValueProps) {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    const displayValue = getCompactNumber(numValue);

    return (
        <Component
            onClick={onClick}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex-shrink-0 whitespace-nowrap ${
                isSelected ? "border-primary/50 bg-primary/10" : "border-border/50 bg-muted/20"
            } ${Component === "button" ? "cursor-pointer hover:bg-muted/30" : ""} ${className}`}
        >
            <div className="text-primary">
                <HandshakeIcon size={14} />
            </div>
            <span className="text-foreground">
                {displayValue}
                {type === "percentage" && "%"}
            </span>
            {description && <span className="text-muted-foreground">{description}</span>}
        </Component>
    );
}
