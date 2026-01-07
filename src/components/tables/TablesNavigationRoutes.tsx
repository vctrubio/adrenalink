"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ENTITY_DATA } from "@/config/entities";

const NAV_ENTITIES = ["student", "teacher", "booking", "schoolPackage", "equipment"];

export function TablesNavigationRoutes() {
    const pathname = usePathname();
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const routes = NAV_ENTITIES.map(id => {
        const entity = ENTITY_DATA.find(e => e.id === id);
        if (!entity) return null;
        return {
            id: entity.id,
            name: entity.name,
            icon: entity.icon,
            color: entity.color,
            link: entity.link,
        };
    }).filter(Boolean) as any[];

    return (
        <nav className="flex items-center justify-center sm:justify-start">
            <div className="flex items-center bg-muted/30 rounded-2xl p-1.5 gap-1">
                {routes.map((entity) => {
                    const isActive = pathname.startsWith(entity.link);
                    const isHovered = hoveredId === entity.id;
                    const Icon = entity.icon;

                    return (
                        <Link 
                            key={entity.id} 
                            href={entity.link} 
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${isActive ? "bg-card shadow-sm" : ""}`} 
                            onMouseEnter={() => setHoveredId(entity.id)} 
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <div className="w-5 h-5 transition-colors [&>svg]:w-full [&>svg]:h-full" style={{ color: isActive || (isHovered && !isActive) ? entity.color : undefined }}>
                                <Icon />
                            </div>
                            <span className={`text-sm hidden sm:inline transition-colors ${isActive ? "font-bold" : "font-medium"}`} style={{ color: isHovered ? entity.color : undefined }}>
                                {entity.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}