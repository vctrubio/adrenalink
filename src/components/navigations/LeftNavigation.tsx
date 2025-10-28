"use client";

import { DevNav } from "@/src/app/landing/dev/DevNav";

type NavigationItem = {
    id: string;
    label: string;
    icon?: React.ReactNode;
    color?: string;
    bgColor?: string;
};

type LeftNavigationProps = {
    items: NavigationItem[];
    activeItem: string;
    onItemClick: (itemId: string) => void;
};

export default function LeftNavigation({ items, activeItem, onItemClick }: LeftNavigationProps) {
    return (
        <nav className="space-y-1.5">
            {items.map((item) => (
                <DevNav
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    icon={item.icon}
                    isActive={activeItem === item.id}
                    onClick={onItemClick}
                    color={item.color}
                    bgColor={item.bgColor}
                />
            ))}
        </nav>
    );
}
