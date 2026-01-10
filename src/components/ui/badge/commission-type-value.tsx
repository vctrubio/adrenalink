"use client";

import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { getCompactNumber } from "@/getters/integer-getter";

interface CommissionTypeValueProps {
    value: string | number;
    type: "fixed" | "percentage";
    description?: string | null;
    onClick?: () => void;
    isSelected?: boolean;
}

export function CommissionTypeValue({ value, type, description, onClick, isSelected }: CommissionTypeValueProps) {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    const displayValue = getCompactNumber(numValue);

    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex-shrink-0 whitespace-nowrap ${
                isSelected ? "border-emerald-500/50 bg-emerald-500/10" : "border-border/50 bg-muted/20"
            }`}
        >
            <div style={{ color: "#10b981" }}>
                <HandshakeIcon size={14} />
            </div>
            <span className="text-foreground">
                {displayValue}
                {type === "percentage" && "%"}
            </span>
            {description && <span className="text-muted-foreground">{description}</span>}
        </button>
    );
}
