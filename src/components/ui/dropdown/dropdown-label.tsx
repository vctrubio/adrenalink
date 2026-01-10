"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { Dropdown, type DropdownItemProps } from "./index";

interface DropdownLabelProps {
    value: string;
    items: DropdownItemProps[];
    color: string;
    disabled?: boolean;
}

export function DropdownLabel({ value, items, color, disabled = false }: DropdownLabelProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const wrappedItems: DropdownItemProps[] = items.map((item) => ({
        ...item,
        onClick: async () => {
            if (item.onClick) {
                setIsLoading(true);
                setIsDropdownOpen(false);
                try {
                    await item.onClick();
                } finally {
                    setIsLoading(false);
                }
            }
        },
    }));

    const isDisabled = disabled || isLoading;

    return (
        <div className="relative inline-block">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isDisabled) {
                        setIsDropdownOpen(!isDropdownOpen);
                    }
                }}
                disabled={isDisabled}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-colors"
                style={{
                    backgroundColor: `${color}20`,
                    color: color,
                    opacity: isDisabled ? 0.5 : 1,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                }}
            >
                <span className="font-medium capitalize">{value}</span>
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : !isDisabled && <ChevronDown className="w-3 h-3" />}
            </button>
            {!isDisabled && (
                <Dropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} items={wrappedItems} align="right" />
            )}
        </div>
    );
}
