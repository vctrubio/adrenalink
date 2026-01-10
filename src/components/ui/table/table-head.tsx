"use client";

import { ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface TableHeadProps {
    children: ReactNode;
    sortable?: boolean;
    sortActive?: boolean;
    sortDirection?: "asc" | "desc";
    onSort?: () => void;
    className?: string;
    align?: "left" | "right" | "center";
}

export function TableHead({
    children,
    sortable = false,
    sortActive = false,
    sortDirection = "asc",
    onSort,
    className = "",
    align = "left",
}: TableHeadProps) {
    const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
    const isClickable = sortable && onSort;

    return (
        <th
            className={`p-3 ${alignClass} font-semibold border-b-2 border-border ${isClickable ? "cursor-pointer hover:text-foreground transition-colors" : ""} ${className}`}
            onClick={onSort}
        >
            <div className="flex items-center gap-1.5">
                {children}
                {sortActive && (
                    <ChevronDownIcon
                        className={`w-4 h-4 flex-shrink-0 transition-transform ${sortDirection === "asc" ? "" : "rotate-180"}`}
                    />
                )}
            </div>
        </th>
    );
}
