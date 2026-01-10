"use client";

import { useState, type ReactNode } from "react";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

interface SidebarContextType {
    collapsed: boolean;
    toggleCollapsed: () => void;
}

import { createContext, useContext } from "react";

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within AdminSidebar");
    }
    return context;
}

interface AdminSidebarProps {
    children: ReactNode;
    defaultCollapsed?: boolean;
}

export function AdminSidebar({ children, defaultCollapsed = false }: AdminSidebarProps) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    const toggleCollapsed = () => setCollapsed(!collapsed);

    return (
        <SidebarContext.Provider value={{ collapsed, toggleCollapsed }}>
            <aside
                className={`relative h-screen border-r border-border bg-gradient-to-b from-background via-background to-blue-500/5 transition-all duration-300 ${
                    collapsed ? "w-16" : "w-64"
                }`}
            >
                {/* Subtle wave pattern overlay */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="wave" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                                <path
                                    d="M0 50 Q 25 25, 50 50 T 100 50"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeWidth="0.5"
                                    className="text-blue-500"
                                />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#wave)" />
                    </svg>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">{children}</div>

                {/* Toggle Button */}
                <button
                    onClick={toggleCollapsed}
                    className="absolute -right-3 top-20 z-20 flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-all duration-200"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <div className={`transform transition-transform duration-300 ${collapsed ? "rotate-90" : "-rotate-90"}`}>
                        <AdranlinkIcon size={14} className="text-white" />
                    </div>
                </button>
            </aside>
        </SidebarContext.Provider>
    );
}
