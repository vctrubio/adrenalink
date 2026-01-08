"use client";

import { usePathname } from "next/navigation";
import { useState, useRef } from "react";
import { FACEBOOK_NAV_ROUTES } from "@/config/facebook-nav-routes";
import { ENTITY_DATA } from "@/config/entities";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { NavigationWizardModal } from "@/src/components/modals/admin/NavigationWizardModal";

const NAV_IDS = ["info", "classboard", "data", "users"] as const;
const DATABOARD_ENTITIES = ["student", "teacher", "schoolPackage", "booking", "equipment"];

export const NavCenter = () => {
    const pathname = usePathname();
    const [isNavModalOpen, setIsNavModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const centerButtonRef = useRef<HTMLButtonElement>(null);

    const databoardEntities = ENTITY_DATA.filter((entity) => DATABOARD_ENTITIES.includes(entity.id));
    const databoardPaths = databoardEntities.map((item) => item.link).filter(Boolean) as string[];
    const routesToRender = FACEBOOK_NAV_ROUTES.filter((route) => NAV_IDS.includes(route.id as (typeof NAV_IDS)[number]));

    const mobileMenuItems: DropdownItemProps[] = routesToRender.map((route) => {
        let isActive = false;
        if (route.id === "data") {
            isActive = pathname.startsWith("/tables") || databoardPaths.some((path) => pathname.startsWith(path));
        } else {
            isActive = pathname.startsWith(route.href);
        }

        if (route.id === "data") {
            return {
                id: route.id,
                label: route.label,
                icon: route.icon,
                active: isActive,
                onClick: () => {
                    setIsNavModalOpen(true);
                    setIsMobileMenuOpen(false);
                },
            };
        }

        return {
            id: route.id,
            label: route.label,
            icon: route.icon,
            active: isActive,
            href: route.href,
            onClick: () => setIsMobileMenuOpen(false),
        };
    });

    return (
        <>
            {/* Mobile - clickable with dropdown */}
            <button
                ref={centerButtonRef}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden px-3 py-1.5 rounded-lg hover:bg-accent/50 active:scale-95 transition-all"
            >
                <h1 className="text-xl font-semibold text-foreground">Adrenalink</h1>
            </button>

            {/* Desktop - static branding */}
            <div className="hidden md:flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-semibold text-foreground">Adrenalink</h1>
            </div>

            {/* Mobile dropdown menu */}
            <div className="md:hidden">
                <Dropdown isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} items={mobileMenuItems} align="center" triggerRef={centerButtonRef} />
            </div>

            <NavigationWizardModal isOpen={isNavModalOpen} onClose={() => setIsNavModalOpen(false)} />
        </>
    );
};
