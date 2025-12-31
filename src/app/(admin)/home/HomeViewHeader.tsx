"use client";

import { LucideIcon } from "lucide-react";

interface HomeViewHeaderProps {
    title: string;
    subtitle: string;
    icon: LucideIcon;
}

export function HomeViewHeader({ title, subtitle, icon: Icon }: HomeViewHeaderProps) {
    return (
        <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/5 text-primary border border-primary/10 shadow-sm ring-4 ring-primary/[0.02]">
                <Icon size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
                <h3 className="text-2xl font-black tracking-tighter text-foreground leading-none">{title}</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mt-0.5 flex items-center gap-2">
                    <span className="w-4 h-px bg-primary/20" />
                    {subtitle}
                </p>
            </div>
        </div>
    );
}
