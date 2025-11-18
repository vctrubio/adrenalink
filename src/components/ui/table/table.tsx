"use client";

import { ReactNode } from "react";

interface TableProps {
    children: ReactNode;
    className?: string;
}

export function Table({ children, className = "" }: TableProps) {
    return (
        <div className={`overflow-x-auto max-h-[600px] overflow-y-auto ${className}`}>
            <table className="w-full border-collapse text-sm">
                {children}
            </table>
        </div>
    );
}
