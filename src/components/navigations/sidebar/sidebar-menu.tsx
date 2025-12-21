"use client";

import { type ReactNode } from "react";

interface SidebarMenuProps {
    children: ReactNode;
}

export function SidebarMenu({ children }: SidebarMenuProps) {
    return (
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4">
            <ul className="space-y-1">{children}</ul>
        </nav>
    );
}
