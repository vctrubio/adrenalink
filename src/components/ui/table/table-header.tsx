"use client";

import { ReactNode } from "react";

interface TableHeaderProps {
    children: ReactNode;
    className?: string;
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
    return (
        <thead className={`bg-muted ${className}`}>
            {children}
        </thead>
    );
}
