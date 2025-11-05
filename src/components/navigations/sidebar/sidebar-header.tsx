"use client";

import { WindToggle } from "../../themes/WindToggle";
import { useSidebar } from "./sidebar";

export function SidebarHeader() {
    const { collapsed } = useSidebar();

    return (
        <div className="p-4 mb-4">
            <div className="flex items-center justify-between">
                {!collapsed && (
                    <div className="flex-1">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                            Adrenalink
                        </h1>
                        <p className="text-xs text-muted-foreground">Admin Dashboard</p>
                    </div>
                )}
                <div className={collapsed ? "mx-auto" : ""}>
                    <WindToggle />
                </div>
            </div>
        </div>
    );
}
