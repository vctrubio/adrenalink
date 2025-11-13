"use client";

import { ReactNode } from "react";

interface TableHeadProps {
    children: ReactNode;
    sortable?: boolean;
    className?: string;
}

export function TableHead({ children, sortable = false, className = "" }: TableHeadProps) {
    return (
        <th className={`px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider ${className}`}>
            {children}
            {sortable && <span className="ml-1 text-muted-foreground">↕</span>}
        </th>
    );
}
