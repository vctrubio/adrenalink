"use client";

import { useRouter } from "next/navigation";
import { type ReactNode } from "react";

interface TagProps {
    icon: ReactNode;
    name: string | ReactNode;
    bgColor: string;
    borderColorHex: string;
    color: string;
    link?: string;
    flagIcon?: ReactNode;
    eventCount?: number;
    durationIcon?: ReactNode;
    duration?: string;
    className?: string;
}

export const Tag = ({ icon, name, bgColor, borderColorHex, color, link, flagIcon, eventCount, durationIcon, duration, className }: TagProps) => {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (link) {
            router.push(link);
        }
    };

    return (
        <div
            className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-all hover:scale-105 border-2 min-w-20 ${link ? "cursor-pointer" : ""} bg-gray-200 dark:bg-gray-800 ${className || ""}`}
            style={{ borderColor: borderColorHex } as React.CSSProperties}
            onClick={link ? handleClick : undefined}
        >
            <div style={{ color }}>{icon}</div>
            <span className="text-foreground text-sm">{name}</span>
            
            {eventCount !== undefined && eventCount > 0 && (
                <div className="flex items-center gap-1 ml-1.5">
                    {flagIcon && <div style={{ color }}>{flagIcon}</div>}
                    <span className="text-foreground text-xs">{eventCount}</span>
                </div>
            )}

            {duration !== undefined && duration !== "0:00" && duration !== "" && (
                <div className="flex items-center gap-1 ml-1.5">
                    {durationIcon && <div style={{ color }}>{durationIcon}</div>}
                    <span className="text-foreground text-xs">{duration}</span>
                </div>
            )}
        </div>
    );
};
