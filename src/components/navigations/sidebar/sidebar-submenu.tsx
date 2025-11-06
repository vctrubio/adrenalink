"use client";

import { useState, type ReactNode, Children, cloneElement, isValidElement } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useSidebar } from "./sidebar";
import { SectionContainer } from "../../ui/section-container";

type SidebarSubmenuProps = {
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    children: ReactNode;
    defaultExpanded?: boolean;
    iconColor?: string;
};

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
            <li className="mb-3">
                <button onClick={toggleExpanded} className="flex items-center justify-center w-full p-2 rounded-lg transition-colors hover:bg-accent" title={label}>
                    <Icon size={18} className={iconColor || "text-foreground"} />
                </button>

                {/* Child icons in flex-wrap grid */}
                {collapsedOpen && <div className="flex flex-wrap gap-1 mt-1 px-1">{children}</div>}
            </li>
        );
    }

    // Expanded view
    const compactChildren = Children.map(children, (child) => {
        if (isValidElement(child)) {
            return cloneElement(child as React.ReactElement<any>, { compact: true });
        }
        return child;
    });

    return (
        <li className="mb-3">
            <SectionContainer
                title={label}
                icon={Icon}
                variant="flat"
                iconColor={iconColor}
                onHeaderClick={toggleExpanded}
                headerAction={
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded();
                        }}
                        className="p-1 hover:bg-accent rounded transition-colors"
                    >
                        {expanded ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
                    </button>
                }
            >
                {expanded ? <ul className="space-y-0.5">{children}</ul> : <div className="flex flex-wrap gap-1 px-1">{compactChildren}</div>}
            </SectionContainer>
        </li>
    );
}
