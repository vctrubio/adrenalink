"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Menu, X, ChartColumnDecreasing, Zap, Wifi, Calendar, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
    { name: "Docs", href: "/landing/dev", icon: BookOpen },
    { name: "Vision", href: "/landing/vision", icon: ChartColumnDecreasing },
    { name: "Automation", href: "/landing/automation", icon: Zap },
    { name: "Revenue", href: "/landing/revenue", icon: ChartColumnDecreasing },
    { name: "Sync", href: "/landing/sync", icon: Wifi },
];

export default function LandingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-background">
            {/* Fixed Navigation */}
            <Popover className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="text-2xl font-bold text-primary">Adrenalink</div>
                            <span className="text-xs text-muted-foreground font-mono">BETA 2026</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                );
                            })}
                            <Link
                                href="/#footer"
                                className="flex items-center gap-2 px-4 py-2 ml-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                            >
                                <Calendar className="w-4 h-4" />
                                Beta 2026
                            </Link>
                        </nav>

                        {/* Mobile Menu Button */}
                        <PopoverButton className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                            {({ open }) => (open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />)}
                        </PopoverButton>
                    </div>
                </div>

                {/* Mobile Navigation Panel */}
                <PopoverPanel className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg">
                    <div className="px-4 py-4 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                        <Link
                            href="/#footer"
                            className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                            <Calendar className="w-5 h-5" />
                            Beta 2026
                        </Link>
                    </div>
                </PopoverPanel>
            </Popover>

            {/* Main Content with top padding to account for fixed nav */}
            <main className="pt-16">{children}</main>
        </div>
    );
}
