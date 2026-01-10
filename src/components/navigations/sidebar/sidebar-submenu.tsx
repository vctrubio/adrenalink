"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useSidebar } from "./sidebar";

interface SidebarSubmenuProps {
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    children: ReactNode;
    defaultExpanded?: boolean;
    iconColor?: string;
}

export function SidebarSubmenu({ label, icon: Icon, children, defaultExpanded = true, iconColor }: SidebarSubmenuProps) {
    const { collapsed } = useSidebar();
    const [expanded, setExpanded] = useState(defaultExpanded);
    const [collapsedOpen, setCollapsedOpen] = useState(false);

    const toggleExpanded = () => {
        if (!collapsed) {
            setExpanded(!expanded);
        } else {
            setCollapsedOpen(!collapsedOpen);
        }
    };

    // Collapsed view with icon grid
    if (collapsed) {
        return (
            <>
                <button
                    onClick={toggleExpanded}
                    className="flex items-center justify-center w-full p-2 rounded-lg transition-colors hover:bg-accent"
                    title={label}
                >
                    <Icon size={18} className={iconColor || "text-foreground"} />
                </button>

                {/* Child icons in flex-wrap grid */}
                {collapsedOpen && <div className="flex flex-wrap gap-1 mt-1 px-1">{children}</div>}
            </>
        );
    }

    // Expanded view
    return (
        <li className="mb-3">
            {/* Header */}
            <button
                onClick={toggleExpanded}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors group"
            >
                <div className="flex items-center gap-2 min-w-0">
                    <Icon size={18} className={iconColor || "text-foreground"} />
                    <span className="text-sm font-medium text-foreground truncate">{label}</span>
                </div>
                <div className="flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
            </button>

            {/* Content */}
            {expanded && <ul className="mt-1 ml-2 pl-2 border-l border-border/50 space-y-0.5">{children}</ul>}
        </li>
    );
}
