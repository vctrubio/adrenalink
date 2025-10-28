"use client";

import { ReactNode } from "react";

type DevNavProps = {
    id: string;
    label: string;
    icon: ReactNode;
    isActive: boolean;
    onClick: (id: string) => void;
    color?: string;
    bgColor?: string;
};

export function DevNav({ id, label, icon, isActive, onClick, color, bgColor }: DevNavProps) {
    return (
        <button
            onClick={() => onClick(id)}
            className={`
                group w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all text-left border
                ${isActive ? `${bgColor || "bg-primary/10"} ${color || "text-primary"} border-current/20` : "text-foreground/70 hover:text-foreground hover:bg-accent/50 border-transparent"}
            `}
        >
            {icon && <span className={`flex-shrink-0 transition-transform ${isActive ? "scale-110" : "group-hover:scale-105"}`}>{icon}</span>}
            <span className={`text-base ${isActive ? "font-semibold" : "font-medium"}`}>{label}</span>
        </button>
    );
}
