"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./sidebar";

interface SidebarMenuItemProps {
    href: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    label: string;
    count?: number;
    onClick?: () => void;
    iconColor?: string;
    compact?: boolean;
}

const isHexColor = (color?: string) => color?.startsWith("#");

export function SidebarMenuItem({ href, icon: Icon, label, count, onClick, iconColor, compact }: SidebarMenuItemProps) {
    const pathname = usePathname();
    const { collapsed } = useSidebar();
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

    const getIconElement = (size: number) => {
        if (isHexColor(iconColor)) {
            const color = isActive ? iconColor : "#9ca3af"; // grey when inactive
            return (
                <span style={{ color, transition: "color 150ms" }}>
                    <Icon size={size} className="transition-colors" />
                </span>
            );
        }
        
        const className = isActive
            ? "text-blue-500"
            : "text-muted-foreground group-hover:text-foreground";
        
        return <Icon size={size} className={`transition-colors ${className}`} />;
    };

    // Compact icon-only view
    if (collapsed || compact) {
        const compactClassName = `group flex items-center justify-center p-2 rounded-md transition-colors duration-200 ${
            isActive ? "bg-blue-500/10" : "hover:bg-accent"
        }`;

        if (onClick) {
            return (
                <li>
                    <button onClick={onClick} className={compactClassName} title={label}>
                        {getIconElement(16)}
                    </button>
                </li>
            );
        }

        return (
            <li>
                <Link href={href} className={compactClassName} title={label}>
                    {getIconElement(16)}
                </Link>
            </li>
        );
    }

    // Expanded full view
    const content = (
        <>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {getIconElement(18)}
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
        isActive ? "bg-blue-500/10" : "hover:bg-accent"
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
