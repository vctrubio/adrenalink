"use client";

import { ReactNode } from "react";

interface TableCellProps {
    children: ReactNode;
    className?: string;
}

export function TableCell({ children, className = "" }: TableCellProps) {
    return (
        <td className={`p-3 ${className}`}>
            {children}
        </td>
    );
}
