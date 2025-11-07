"use client";

import { useSidebar } from "./sidebar";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

interface SidebarHeaderProps {
    schoolName?: string | null;
}

export function SidebarHeader({ schoolName }: SidebarHeaderProps) {
    const { collapsed } = useSidebar();

    if (collapsed) return null;

    return (
        <div className="p-4 mb-4">
            <div className="flex items-center gap-6">
                <AdranlinkIcon size={48} className="text-gray-500 animate-fade-in" />
                <div className="animate-fade-in-delayed flex-1">
                    <h3 className="text-3xl font-bold dark:text-blue-500">Adrenalink</h3>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        <span className="font-semibold">
                            {schoolName === "SUDO" ? "beta 2026" : schoolName || "..."}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
