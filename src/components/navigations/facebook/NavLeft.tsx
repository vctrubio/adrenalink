"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { FACEBOOK_NAV_ROUTES } from "@/config/facebook-nav-routes";
import { ENTITY_DATA } from "@/config/entities";
import { DropdownItem } from "@/src/components/ui/dropdown";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { NavigationWizardModal } from "@/src/components/modals/NavigationWizardModal";

const NAV_IDS = ["info", "classboard", "data", "users"] as const;
const DATABOARD_ENTITIES = ["student", "teacher", "schoolPackage", "booking", "equipment"];

export const NavLeft = () => {
    const pathname = usePathname();
    const [isNavModalOpen, setIsNavModalOpen] = useState(false);
    const credentials = useSchoolCredentials();
    const logoUrl = credentials?.logo || null;
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

    return (
        <>
            <div className="flex items-center gap-1">
                <Link href="/" className="flex items-center">
                    {logoUrl ? <Image src={logoUrl} alt={schoolUsername || "School Logo"} width={40} height={40} className="rounded-full object-cover" priority /> : <AdranlinkIcon size={40} className="text-secondary" />}
                </Link>
                {routesToRender.map((route) => {
                    let isActive = false;
                    if (route.id === "data") {
                        isActive = databoardPaths.some((path) => pathname.startsWith(path));
                    } else if (route.id === "info") {
                        isActive = pathname.startsWith("/home");
                    } else {
                        isActive = pathname.startsWith(route.href);
                    }

                    if (route.id === "data") {
                        return (
                            <DropdownItem
                                key={route.href}
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
                            key={route.href}
                            item={{
                                href: route.id === "info" ? "/home" : route.href,
                                icon: route.icon,
                                active: isActive,
                            }}
                            variant="nav"
                        />
                    );
                })}
            </div>
            <NavigationWizardModal isOpen={isNavModalOpen} onClose={() => setIsNavModalOpen(false)} />
        </>
    );
};