"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useSidebar } from "./sidebar";

type SidebarSubmenuProps = {
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    children: ReactNode;
    defaultExpanded?: boolean;
};

export function SidebarSubmenu({ label, icon: Icon, children, defaultExpanded = true }: SidebarSubmenuProps) {
    const { collapsed } = useSidebar();
    const [expanded, setExpanded] = useState(defaultExpanded);

    const toggleExpanded = () => {
        if (!collapsed) {
            setExpanded(!expanded);
        }
    };

    return (
        <li className="mb-1">
            <button
                onClick={toggleExpanded}
                className={`group flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-accent ${
                    collapsed ? "justify-center" : ""
                }`}
                title={collapsed ? label : undefined}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon size={18} className="flex-shrink-0 text-foreground transition-colors" />
                    {!collapsed && (
                        <span className="text-sm font-medium text-foreground truncate">
                            {label}
                        </span>
                    )}
                </div>
                {!collapsed && (
                    <div className="flex-shrink-0">
                        {expanded ? (
                            <ChevronDown size={14} className="text-muted-foreground transition-transform" />
                        ) : (
                            <ChevronRight size={14} className="text-muted-foreground transition-transform" />
                        )}
                    </div>
                )}
            </button>

            {expanded && !collapsed && (
                <ul className="mt-1 space-y-0.5">
                    {children}
                </ul>
            )}
        </li>
    );
}
