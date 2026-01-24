"use client";

import { usePathname } from "next/navigation";
import { FACEBOOK_NAV_ROUTES } from "@/config/facebook-nav-routes";
import { ENTITY_DATA } from "@/config/entities";

const NAV_IDS = ["info", "classboard", "data", "users", "invitations"] as const;
const TABLE_ENTITIES = ["student", "teacher", "schoolPackage", "booking", "equipment"];

export const NavCenter = () => {
    const pathname = usePathname();
    
    const tableEntities = ENTITY_DATA.filter((entity) => TABLE_ENTITIES.includes(entity.id));
    const tablePaths = tableEntities.map((item) => item.link).filter(Boolean) as string[];
    const routesToRender = FACEBOOK_NAV_ROUTES.filter((route) => NAV_IDS.includes(route.id as (typeof NAV_IDS)[number]));
    
    // Check if there's an active route
    const hasActiveRoute = routesToRender.some((route) => {
        if (route.id === "data") {
            return pathname.startsWith("/tables") || tablePaths.some((path) => pathname.startsWith(path));
        }
        return pathname.startsWith(route.href);
    });

    // Check if we're on the register route
    const isRegisterRoute = pathname.startsWith("/register");
    const displayText = isRegisterRoute ? "Check in" : "Adrenalink";

    return (
        <>
            {/* Small screens: show when there's an active route (only one icon showing) */}
            {hasActiveRoute && (
                <div className="md:hidden flex flex-col items-center justify-center text-center">
                    <h1 className="text-lg font-semibold text-foreground">{displayText}</h1>
                </div>
            )}
            {/* Desktop - static branding */}
            <div className="hidden lg:flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-semibold text-foreground">{displayText}</h1>
            </div>
        </>
    );
};

