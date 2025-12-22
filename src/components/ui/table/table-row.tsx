"use client";

import { ReactNode } from "react";

interface TableRowProps {
    children: ReactNode;
    onClick?: () => void;
    isSelected?: boolean;
    selectedColor?: string;
    className?: string;
}

export function TableRow({ children, onClick, isSelected = false, selectedColor, className = "" }: TableRowProps) {
    const borderColor = selectedColor || "#3b82f6"; // Fallback to primary blue if no color provided

    return (
        <tr
            onClick={onClick}
            className={`border-b border-border hover:bg-muted/30 transition-colors ${
                onClick ? "cursor-pointer" : ""
            } ${
                isSelected ? "border-l-4" : ""
            } ${className}`}
            style={isSelected ? {
                backgroundColor: `${borderColor}10`,
                borderLeftColor: borderColor
            } : undefined}
        >
            {children}
        </tr>
    );
}
