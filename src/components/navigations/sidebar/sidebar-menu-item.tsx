"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { useSidebar } from "./sidebar";

type SidebarMenuItemProps = {
    href: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    label: string;
    count?: number;
    onClick?: () => void;
    iconColor?: string;
    compact?: boolean;
};

export function SidebarMenuItem({ href, icon: Icon, label, count, onClick, iconColor, compact }: SidebarMenuItemProps) {
    const pathname = usePathname();
    const { collapsed } = useSidebar();
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

    // Compact icon-only view (for collapsed sidebar or compact mode)
    if (collapsed || compact) {
        const compactClassName = `group flex items-center justify-center p-2 rounded-md transition-colors duration-200 ${
            isActive ? "bg-blue-500/10" : "hover:bg-accent"
        }`;

        const compactContent = (
            <Icon
                size={16}
                className={`transition-colors ${
                    iconColor || (isActive ? "text-blue-500" : "text-muted-foreground group-hover:text-foreground")
                }`}
            />
        );

        if (onClick) {
            return (
                <li>
                    <button onClick={onClick} className={compactClassName} title={label}>
                        {compactContent}
                    </button>
                </li>
            );
        }

        return (
            <li>
                <Link href={href} className={compactClassName} title={label}>
                    {compactContent}
                </Link>
            </li>
        );
    }

    // Expanded full view
    const content = (
        <>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <Icon
                    size={18}
                    className={`flex-shrink-0 transition-colors ${
                        iconColor || (isActive ? "text-blue-500" : "text-muted-foreground group-hover:text-foreground")
                    }`}
                />
                <span
                    className={`text-sm font-medium truncate transition-colors ${
                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                >
                    {label}
                </span>
            </div>
            {count !== undefined && count > 0 && (
                <span className="flex-shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold bg-blue-500 text-white rounded-full">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </>
    );

    const className = `group flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors duration-200 ${
        isActive
            ? "bg-blue-500/10"
            : "hover:bg-accent"
    }`;

    if (onClick) {
        return (
            <li>
                <button onClick={onClick} className={className} title={label}>
                    {content}
                </button>
            </li>
        );
    }

    return (
        <li>
            <Link href={href} className={className} title={label}>
                {content}
            </Link>
        </li>
    );
}
