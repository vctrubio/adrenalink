"use client";

import { ReactNode } from "react";

interface TableHeadProps {
    children: ReactNode;
    sortable?: boolean;
    className?: string;
    align?: "left" | "right" | "center";
}

export function TableHead({ children, sortable = false, className = "", align = "left" }: TableHeadProps) {
    const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

    return (
        <th className={`p-3 ${alignClass} font-semibold border-b border-border ${className}`}>
            {children}
            {sortable && <span className="ml-1 text-muted-foreground">↕</span>}
        </th>
    );
}
