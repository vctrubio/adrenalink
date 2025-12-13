"use client";
import { usePathname } from "next/navigation";
import { FACEBOOK_NAV_ROUTES } from "@/config/facebook-nav-routes";
import { ENTITY_DATA } from "@/config/entities";

export const NavCenter = () => {
    const pathname = usePathname();

    const getCurrentRoute = () => {
        const entity = ENTITY_DATA.find((e) => e.link && pathname.startsWith(e.link));
        if (entity) {
            return { name: entity.name, icon: entity.icon, color: entity.color };
        }

        const route = FACEBOOK_NAV_ROUTES.find((r) => {
            if (r.id === "home") {
                return pathname === r.href;
            }
            return pathname.startsWith(r.href);
        });

        if (route) {
            return { name: route.name, icon: route.icon, color: undefined };
        }

        const segments = pathname.split("/").filter(Boolean);
        if (segments.length > 0) {
            return {
                name: segments[0].charAt(0).toUpperCase() + segments[0].slice(1),
                icon: null,
                color: undefined,
            };
        }

        return { name: "Home", icon: null, color: undefined };
    };

    const currentRoute = getCurrentRoute();
    const Icon = currentRoute.icon;

    return (
        <div className="hidden md:flex flex-col items-center justify-center text-center">
            <h1 className="text-lg font-semibold text-foreground">Adrenalink</h1>
            <div className="flex items-center gap-1.5">
                {Icon && (
                    <div style={currentRoute.color ? { color: currentRoute.color } : undefined}>
                        <Icon className="w-3.5 h-3.5" />
                    </div>
                )}
                <p className="text-xs text-muted-foreground">{currentRoute.name}</p>
            </div>
        </div>
    );
};
