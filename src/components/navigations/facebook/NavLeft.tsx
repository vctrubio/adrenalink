"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { FACEBOOK_NAV_ROUTES } from "@/config/facebook-nav-routes";
import { ENTITY_DATA } from "@/config/entities";
import { Dropdown, DropdownItem, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";

const NAV_IDS = ["info", "classboard", "data", "users"] as const;
const DATABOARD_ENTITIES = ["student", "teacher", "schoolPackage", "booking", "equipment", "event"];

export const NavLeft = () => {
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const credentials = useSchoolCredentials();
    const logoUrl = credentials?.logo || null;
    const schoolUsername = credentials?.username || null;

    const databoardEntities = ENTITY_DATA.filter((entity) => DATABOARD_ENTITIES.includes(entity.id));
    const databoardDropdownItems: DropdownItemProps[] = databoardEntities.map((entity) => ({
        id: entity.id,
        label: entity.name,
        href: entity.link,
        icon: entity.icon,
        color: entity.color,
    }));

    const databoardPaths = databoardDropdownItems.map((item) => item.href).filter(Boolean) as string[];

    const activeDropdownItem = databoardDropdownItems.find((item) => item.href && pathname.startsWith(item.href));
    const routesToRender = FACEBOOK_NAV_ROUTES.filter((route) => NAV_IDS.includes(route.id as (typeof NAV_IDS)[number]));

    return (
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
                        <div key={route.href} className="relative">
                            <DropdownItem
                                item={{
                                    icon: route.icon,
                                    active: isActive,
                                    onClick: () => setIsDropdownOpen(!isDropdownOpen),
                                }}
                                variant="nav"
                            />
                            <Dropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} items={databoardDropdownItems} align="center" initialFocusedId={activeDropdownItem?.id} />
                        </div>
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
    );
};
