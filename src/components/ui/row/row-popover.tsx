"use client";

import { type ReactNode, useState } from "react";

export interface PopoverItem {
    id: string;
    icon: ReactNode;
    color: string;
    label?: ReactNode | string;
}

interface RowPopoverProps {
    items: PopoverItem[];
}

export const RowPopover = ({ items }: RowPopoverProps) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                >
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                        style={{ backgroundColor: item.color + "30", color: item.color }}
                    >
                        {item.icon}
                    </div>

                    {hoveredId === item.id && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-md shadow-lg whitespace-nowrap z-50">
                            <div className="text-xs font-mono text-popover-foreground">
                                {item.label || item.id}
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-popover border-r border-b border-border rotate-45" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
