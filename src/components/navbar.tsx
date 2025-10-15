"use client";

import { Home, Code, Settings, User, UserPlus, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "@headlessui/react";
import ToggleTheme from "./toggle-theme";
import { ENTITY_DATA } from "../../config/entities";

const navigationItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/welcome", icon: UserPlus, label: "Welcome" },
    { href: "/dev", icon: Code, label: "Dev" },
    { href: "/docs", icon: BookOpen, label: "Docs" },
];

const tableNavigationItems = ENTITY_DATA.map((entity) => ({
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
    return (
        <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors hover:bg-muted">
                <User size={18} />
                <span className="text-sm">Menu</span>
            </Menu.Button>

            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                    {userMenuItems.map(({ href, icon: Icon, label }) => (
                        <Menu.Item key={href}>
                            {({ active }) => (
                                <Link href={href} className={`${active ? "bg-muted" : ""} group flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors`}>
                                    <Icon size={16} />
                                    {label}
                                </Link>
                            )}
                        </Menu.Item>
                    ))}
                </div>
            </Menu.Items>
        </Menu>
    );
}

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
            <div className="max-w-7xl mx-auto px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex space-x-8">
                        {navigationItems.map(({ href, icon: Icon, label }) => (
                            <Link key={href} href={href} className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${pathname === href ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-900"}`}>
                                <Icon size={18} />
                                <span>{label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <ToggleTheme />
                        <UserDropdown />
                    </div>
                </div>

                {/* Entity Tables Navigation Row */}
                <div className="border-t border-gray-100 dark:border-gray-900 py-2">
                    <div className="flex flex-wrap gap-2">
                        {tableNavigationItems.map(({ href, icon: Icon, label, color, bgColor }) => (
                            <Link key={href} href={href} className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${pathname === href ? `${bgColor} text-white` : `hover:${bgColor} hover:text-white`}`}>
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
