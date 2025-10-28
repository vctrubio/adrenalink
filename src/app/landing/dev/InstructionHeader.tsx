"use client";

import { ReactNode } from "react";

type InstructionHeaderProps = {
    icon: React.ComponentType<{ className?: string; size?: number }>;
    title: string;
    subtitle?: string;
    bgColor: string;
    iconColor: string;
    iconBgColor: string;
    children: ReactNode;
};

export function InstructionHeader({ icon: Icon, title, subtitle, bgColor, iconColor, iconBgColor, children }: InstructionHeaderProps) {
    return (
        <div className={`relative p-8 ${bgColor}`}>
            <div className={`absolute top-8 left-8 ${iconBgColor} p-4 rounded-full flex items-center justify-center z-10`}>
                <Icon className={`${iconColor} w-8 h-8`} size={32} />
            </div>
            <div className="text-center mb-8">
                <h3 className="text-5xl font-bold text-foreground mb-2">{title}</h3>
                {subtitle && <h4 className="text-2xl font-semibold text-foreground/80">{subtitle}</h4>}
            </div>
            <div className="max-w-3xl mx-auto">{children}</div>
        </div>
    );
}
