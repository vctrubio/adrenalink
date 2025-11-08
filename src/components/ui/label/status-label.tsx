"use client";

import { useState } from "react";
import { getStatusColor, type StatusColorType } from "@/types/status-enum";

interface StatusLabelProps {
    status: string;
    options?: string[];
    onStatusChange?: (newStatus: string) => void;
}

const colorMap: Record<StatusColorType, string> = {
    default: "subscription-default",
    blue: "subscription-blue",
    gold: "subscription-gold",
};

const bgColorMap: Record<StatusColorType, string> = {
    default: "bg-subscription-default/10",
    blue: "bg-subscription-blue/10",
    gold: "bg-subscription-gold/10",
};

/**
 * StatusLabel Component
 * Displays entity status with color coding (default/blue/gold)
 * Dropdown appears when options are provided for status changes
 *
 * NOTE: onStatusChange will trigger API calls through entity update actions
 * with revalidatePath to refresh cached data. No manual fetch needed.
 */
export const StatusLabel = ({ status, options = [], onStatusChange }: StatusLabelProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const type = getStatusColor(status);
    const colorClass = colorMap[type];
    const bgColorClass = bgColorMap[type];

    const handleSelect = (newStatus: string) => {
        onStatusChange?.(newStatus);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`px-3 py-1 rounded-md text-xs font-medium text-${colorClass} ${bgColorClass} border border-${colorClass} hover:opacity-80 transition-opacity cursor-pointer`}
            >
                {status}
                {options.length > 0 && <span className="ml-2">▼</span>}
            </button>

            {isOpen && options.length > 0 && (
                <div className="absolute top-full mt-2 left-0 bg-card border border-border rounded-md shadow-lg z-50 min-w-max">
                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => handleSelect(option)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent/50 text-foreground transition-colors first:rounded-t-md last:rounded-b-md"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
