"use client";

import { useRouter } from "next/navigation";
import { type ReactNode } from "react";

interface TagProps {
    icon: ReactNode;
    name: string;
    bgColor: string;
    borderColorHex: string;
    color: string;
    link?: string;
}

export const Tag = ({ icon, name, bgColor, borderColorHex, color, link }: TagProps) => {
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
            className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-all hover:scale-105 border-2 min-w-20 ${link ? "cursor-pointer" : ""}`}
            style={{ backgroundColor: bgColor, borderColor: borderColorHex }}
            onClick={link ? handleClick : undefined}
        >
            <div style={{ color }}>{icon}</div>
            <span className="text-foreground text-sm">{name}</span>
        </div>
    );
};
