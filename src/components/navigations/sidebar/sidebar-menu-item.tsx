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
};

export function SidebarMenuItem({ href, icon: Icon, label, count, onClick }: SidebarMenuItemProps) {
    const pathname = usePathname();
    const { collapsed } = useSidebar();
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

    const content = (
        <>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <Icon
                    size={18}
                    className={`flex-shrink-0 transition-colors ${
                        isActive ? "text-blue-500" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                />
                {!collapsed && (
                    <span
                        className={`text-sm font-medium truncate transition-colors ${
                            isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                        }`}
                    >
                        {label}
                    </span>
                )}
            </div>
            {!collapsed && count !== undefined && count > 0 && (
                <span className="flex-shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold bg-blue-500 text-white rounded-full">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </>
    );

    const className = `group flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors duration-200 ${
        collapsed ? "justify-center" : ""
    } ${
        isActive
            ? "bg-blue-500/10"
            : "hover:bg-accent"
    }`;

    if (onClick) {
        return (
            <li>
                <button onClick={onClick} className={className} title={collapsed ? label : undefined}>
                    {content}
                </button>
            </li>
        );
    }

    return (
        <li>
            <Link href={href} className={className} title={collapsed ? label : undefined}>
                {content}
            </Link>
        </li>
    );
}
