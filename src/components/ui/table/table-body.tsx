"use client";

import { ReactNode } from "react";

interface TableBodyProps {
    children: ReactNode;
    className?: string;
}

export function TableBody({ children, className = "" }: TableBodyProps) {
    return (
        <tbody className={`bg-card divide-y divide-muted ${className}`}>
            {children}
        </tbody>
    );
}
