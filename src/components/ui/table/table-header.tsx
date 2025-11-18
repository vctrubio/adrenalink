"use client";

import { ReactNode } from "react";

interface TableHeaderProps {
    children: ReactNode;
    className?: string;
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
    return (
        <thead className={`sticky top-0 bg-muted/80 backdrop-blur ${className}`}>
            {children}
        </thead>
    );
}
