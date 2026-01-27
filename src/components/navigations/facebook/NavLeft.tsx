"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FACEBOOK_NAV_ROUTES } from "@/config/facebook-nav-routes";
import { ENTITY_DATA } from "@/config/entities";
import { DropdownItem } from "@/src/components/ui/dropdown";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { NavigationWizardModal } from "@/src/components/modals/admin/NavigationWizardModal";

const NAV_IDS = ["info", "classboard", "data", "users", "invitations", "help"] as const;
const TABLE_ENTITIES = ["student", "teacher", "schoolPackage", "booking", "equipment"];

export const NavLeft = () => {
    const pathname = usePathname();
    const [isNavModalOpen, setIsNavModalOpen] = useState(false);
    const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
    const mobileButtonRef = useRef<HTMLButtonElement>(null);
    const credentials = useSchoolCredentials();
    const schoolUsername = credentials?.username || null;

    const tableEntities = ENTITY_DATA.filter((entity) => TABLE_ENTITIES.includes(entity.id));
    const tablePaths = tableEntities.map((item) => item.link).filter(Boolean) as string[];
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

    // Find active route
    const activeRoute = routesToRender.find((route) => {
        if (route.id === "data") {
            return pathname.startsWith("/tables") || tablePaths.some((path) => pathname.startsWith(path));
        }
        return pathname.startsWith(route.href);
    });

    // Mobile dropdown items
    const mobileDropdownItems: DropdownItemProps[] = routesToRender.map((route) => {
        let isActive = false;
        if (route.id === "data") {
            isActive = pathname.startsWith("/tables") || tablePaths.some((path) => pathname.startsWith(path));
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
                    setIsMobileDropdownOpen(false);
                },
            };
        }

        return {
            id: route.id,
            label: route.label,
            icon: route.icon,
            active: isActive,
            href: route.href,
            onClick: () => setIsMobileDropdownOpen(false),
        };
    });

    return (
        <>
            <div className="flex items-center gap-1">
                {/* Mobile: Icon with active route icon and dropdown */}
                <div className="md:hidden relative flex items-center gap-1">
                    <button
                        ref={mobileButtonRef}
                        onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                        className="flex items-center gap-1"
                    >
                        <Image
                            src="/prototypes/north-icon.png"
                            alt={schoolUsername || "School Logo"}
                            width={48}
                            height={48}
                            className="rounded-full object-cover w-12 h-12"
                            priority
                        />
                        {activeRoute && activeRoute.icon && (
                            <div className="relative flex h-14 w-24 items-center justify-center text-primary transition-colors rounded-lg">
                                <activeRoute.icon className="h-7 w-7 text-primary" />
                                <div className="absolute bottom-0 h-1 w-full bg-primary" />
                            </div>
                        )}
                    </button>
                    <Dropdown
                        isOpen={isMobileDropdownOpen}
                        onClose={() => setIsMobileDropdownOpen(false)}
                        items={mobileDropdownItems}
                        align="left"
                        triggerRef={mobileButtonRef as React.RefObject<HTMLElement>}
                    />
                </div>

                {/* Desktop: Icon with navigation items */}
                <div className="hidden md:flex items-center gap-1">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/prototypes/north-icon.png"
                            alt={schoolUsername || "School Logo"}
                            width={56}
                            height={56}
                            className="rounded-full object-cover w-14 h-14"
                            priority
                        />
                    </Link>
                    {routesToRender.map((route) => {
                        let isActive = false;
                        if (route.id === "data") {
                            isActive = pathname.startsWith("/tables") || tablePaths.some((path) => pathname.startsWith(path));
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
                                    prefetch: (route as any).prefetch,
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
