"use client";

import { useState } from "react";
import { Home, Code, Settings, User, BookOpen, Table } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ToggleTheme from "../themes/toggle-theme";
import { ENTITY_DATA } from "../../../config/entities";
import { HIDDEN_ENTITIES } from "../../../config/tables";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";

const navigationItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/table", icon: Table, label: "Table" },
];

const visibleNavigationItems = ENTITY_DATA.map((entity) => ({
    href: entity.link,
    icon: entity.icon,
    label: entity.name,
    color: entity.color,
    bgColor: entity.bgColor,
}));

const hiddenNavigationItems = HIDDEN_ENTITIES.map((entity) => ({
    href: entity.link,
    icon: entity.icon,
    label: entity.name,
    color: entity.color,
    bgColor: entity.bgColor,
}));

const userMenuItems = [
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/settings", icon: Settings, label: "Settings" },
];

function UserDropdown() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const dropdownItems: DropdownItemProps[] = userMenuItems.map(({ href, icon, label }) => ({
        id: href,
        label,
        icon,
        href,
    }));

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out text-foreground hover:bg-primary/10 hover:text-primary hover:scale-105 hover:shadow-md"
            >
                <User size={18} className="transition-transform duration-300 hover:scale-110" />
                <span className="text-sm">Menu</span>
            </button>
            <Dropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} items={dropdownItems} align="right" />
        </div>
    );
}

export default function Devbar() {
    const pathname = usePathname();

    return (
        <nav className="border-b border-border bg-background">
            <div className=" mx-auto px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex space-x-2">
                        {navigationItems.map(({ href, icon: Icon, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out ${
                                    pathname === href
                                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                        : "text-foreground hover:bg-primary/10 hover:text-primary hover:scale-105 hover:shadow-md"
                                }`}
                            >
                                <Icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
                                <span className="text-sm">{label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <ToggleTheme />
                        <UserDropdown />
                    </div>
                </div>

                {/* Visible Entities Navigation Row */}
                <div className="border-t border-border py-2">
                    <div className="flex flex-wrap gap-2">
                        {visibleNavigationItems.map(({ href, icon: Icon, label, color, bgColor }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${pathname === href ? `${bgColor} text-white` : `text-foreground hover:${bgColor} hover:text-white`}`}
                            >
                                <Icon size={14} className={pathname === href ? "text-white" : color} />
                                <span className="text-xs">{label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Hidden Entities Navigation Row */}
                <div className="border-t border-border py-2">
                    <div className="flex flex-wrap gap-2">
                        {hiddenNavigationItems.map(({ href, icon: Icon, label, color, bgColor }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${pathname === href ? `${bgColor} text-white` : `text-foreground hover:${bgColor} hover:text-white`}`}
                            >
                                <Icon size={14} className={pathname === href ? "text-white" : color} />
                                <span className="text-xs">{label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
