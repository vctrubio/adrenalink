"use client";

import { Home, Code, Settings, User, UserPlus, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "@headlessui/react";
import ToggleTheme from "../toggle-theme";
import { ENTITY_DATA } from "../../../config/entities";

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
            <Menu.Button className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out text-foreground hover:bg-primary/10 hover:text-primary hover:scale-105 hover:shadow-md">
                <User size={18} className="transition-transform duration-300 hover:scale-110" />
                <span className="text-sm">Menu</span>
            </Menu.Button>

            <Menu.Items className="absolute right-0 z-10 mt-3 w-52 origin-top-right rounded-xl bg-card border border-border shadow-xl shadow-primary/5 backdrop-blur-sm">
                <div className="py-2">
                    {userMenuItems.map(({ href, icon: Icon, label }) => (
                        <Menu.Item key={href}>
                            {({ active }) => (
                                <Link
                                    href={href}
                                    className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 ease-out ${active ? "bg-primary/10 text-primary scale-105 shadow-sm" : "text-foreground hover:bg-primary/10 hover:text-primary hover:scale-105 hover:shadow-sm"
                                        }`}
                                >
                                    <Icon size={16} className="transition-transform duration-200 group-hover:scale-110" />
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
        <nav className="border-b border-border bg-background">
            <div className="max-w-7xl mx-auto px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex space-x-2">
                        {navigationItems.map(({ href, icon: Icon, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-out ${pathname === href ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "text-foreground hover:bg-primary/10 hover:text-primary hover:scale-105 hover:shadow-md"
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

                {/* Entity Tables Navigation Row */}
                <div className="border-t border-border py-2">
                    <div className="flex flex-wrap gap-2">
                        {tableNavigationItems.map(({ href, icon: Icon, label, color, bgColor }) => (
                            <Link key={href} href={href} className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors ${pathname === href ? `${bgColor} text-white` : `text-foreground hover:${bgColor} hover:text-white`}`}>
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
