"use client";

import { ReactNode } from "react";

interface TableRowProps {
    children: ReactNode;
    onClick?: () => void;
    isSelected?: boolean;
    className?: string;
}

export function TableRow({ children, onClick, isSelected = false, className = "" }: TableRowProps) {
    return (
        <tr
            onClick={onClick}
            className={`transition-colors ${
                onClick ? "cursor-pointer hover:bg-accent/50" : ""
            } ${
                isSelected ? "bg-primary/10 border-l-4 border-l-primary" : ""
            } ${className}`}
        >
            {children}
        </tr>
    );
}
