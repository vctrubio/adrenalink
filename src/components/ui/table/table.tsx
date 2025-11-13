"use client";

import { ReactNode } from "react";

interface TableProps {
    children: ReactNode;
    className?: string;
}

export function Table({ children, className = "" }: TableProps) {
    return (
        <div className={`overflow-x-auto border border-muted ${className}`}>
            <table className="w-full">
                {children}
            </table>
        </div>
    );
}
