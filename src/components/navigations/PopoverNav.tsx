"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { WindToggle } from "@/src/components/themes/WindToggle";
import { usePathname } from "next/navigation";

interface NavItem {
    name: string;
    icon: LucideIcon;
    link: string;
}

interface PopoverNavProps {
    items: NavItem[];
}

export default function PopoverNav({ items }: PopoverNavProps) {
    const pathname = usePathname();
    const currentItem = items.find((item) => pathname === item.link) || items[0];
    const CurrentIcon = currentItem.icon;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
            <Popover className="relative">
                <PopoverButton className="flex items-center gap-2 px-6 py-3 rounded-full border border-secondary/60 bg-card/80 backdrop-blur-md shadow-lg hover:bg-card transition-all duration-300">
                    <CurrentIcon className="w-5 h-5 text-secondary" />
                    <span className="font-semibold tracking-tight text-foreground">{currentItem.name}</span>
                    <ChevronDown className="w-4 h-4 text-secondary" />
                </PopoverButton>

                <PopoverPanel className="absolute left-1/2 -translate-x-1/2 z-10 mt-2 w-72 rounded-xl bg-card/95 backdrop-blur-md border border-border shadow-2xl overflow-hidden">
                    <div className="p-3 space-y-1">
                        {items.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = pathname === item.link;
                            return (
                                <Link
                                    key={item.link}
                                    href={item.link}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive ? "bg-accent" : "hover:bg-accent"}`}
                                >
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${isActive ? "bg-secondary/20" : "bg-muted/50 group-hover:bg-muted"}`}>
                                        <IconComponent className={`w-5 h-5 transition-colors ${isActive ? "text-secondary" : "text-muted-foreground group-hover:text-foreground"}`} />
                                    </div>
                                    <div className="flex-1">
                                        <span className={`font-medium text-sm ${isActive ? "text-secondary" : "text-foreground"}`}>{item.name}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </PopoverPanel>
            </Popover>
            <WindToggle />
        </div>
    );
}
