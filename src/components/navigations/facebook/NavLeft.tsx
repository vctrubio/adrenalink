"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FACEBOOK_NAV_ROUTES } from "@/config/facebook-nav-routes";
import { ENTITY_DATA } from "@/config/entities";
import { DropdownItem } from "@/src/components/ui/dropdown";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { NavigationWizardModal } from "@/src/components/modals/admin/NavigationWizardModal";

const NAV_IDS = ["info", "classboard", "data", "users", "invitations"] as const;
const DATABOARD_ENTITIES = ["student", "teacher", "schoolPackage", "booking", "equipment"];

export const NavLeft = () => {
    const pathname = usePathname();
    const [isNavModalOpen, setIsNavModalOpen] = useState(false);
    const credentials = useSchoolCredentials();
    const logoUrl = credentials?.logoUrl || ""; // Fallback to empty string but safeguard below
    const schoolUsername = credentials?.username || null;

    const databoardEntities = ENTITY_DATA.filter((entity) => DATABOARD_ENTITIES.includes(entity.id));
    const databoardPaths = databoardEntities.map((item) => item.link).filter(Boolean) as string[];
    const routesToRender = FACEBOOK_NAV_ROUTES.filter((route) => NAV_IDS.includes(route.id as (typeof NAV_IDS)[number]));

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsNavModalOpen((prev) => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Safety check for Image src
    if (!logoUrl) {
        return null; // Or some skeleton/placeholder logic, but avoiding the crash
    }

    return (
        <>
            <div className="flex items-center gap-1">
                <Link href="/" className="flex items-center">
                    <Image
                        src={logoUrl}
                        alt={schoolUsername || "School Logo"}
                        width={36}
                        height={36}
                        className="rounded-full object-cover md:w-10 md:h-10"
                        priority
                    />
                </Link>

                {/* Desktop navigation */}
                <div className="hidden md:flex items-center gap-1">
                    {routesToRender.map((route) => {
                        let isActive = false;
                        if (route.id === "data") {
                            isActive = pathname.startsWith("/tables") || databoardPaths.some((path) => pathname.startsWith(path));
                        } else {
                            isActive = pathname.startsWith(route.href);
                        }

                        if (route.id === "data") {
                            return (
                                <DropdownItem
                                    key={route.id}
                                    item={{
                                        icon: route.icon,
                                        active: isActive,
                                        onClick: () => setIsNavModalOpen(true),
                                    }}
                                    variant="nav"
                                />
                            );
                        }

                        return (
                            <DropdownItem
                                key={route.id}
                                item={{
                                    href: route.href,
                                    icon: route.icon,
                                    active: isActive,
                                }}
                                variant="nav"
                            />
                        );
                    })}
                </div>
            </div>
            <NavigationWizardModal isOpen={isNavModalOpen} onClose={() => setIsNavModalOpen(false)} />
        </>
    );
};
