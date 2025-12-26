"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DATABOARD_ENTITIES } from "@/config/databoard-routes";

export function DataboardNavigationRoutes() {
    const pathname = usePathname();

    return (
        <nav className="flex items-center justify-center sm:justify-start">
            <div className="flex items-center bg-muted/30 rounded-2xl p-1.5 gap-1">
                {DATABOARD_ENTITIES.map((entity) => {
                    const isActive = pathname.startsWith(entity.link);
                    const Icon = entity.icon;

                    return (
                        <Link
                            key={entity.id}
                            href={entity.link}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                                isActive
                                    ? "bg-card shadow-sm"
                                    : "hover:bg-card/50"
                            }`}
                        >
                            <Icon
                                className="w-5 h-5"
                                style={{ color: isActive ? entity.color : undefined }}
                            />
                            <span
                                className={`text-sm font-medium hidden sm:inline ${
                                    isActive ? "text-foreground" : "text-muted-foreground"
                                }`}
                            >
                                {entity.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
