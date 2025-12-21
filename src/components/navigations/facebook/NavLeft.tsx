"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { FACEBOOK_NAV_ROUTES } from "@/config/facebook-nav-routes";
import { ENTITY_DATA } from "@/config/entities";
import { Dropdown, DropdownItem, type DropdownItemProps } from "@/src/components/ui/dropdown";

const databoardPaths = ["/data", "/students", "/teachers", "/bookings", "/equipments", "/packages", "/rentals", "/referrals", "/requests", "/events"];
const DATABOARD_ENTITIES = ["student", "teacher", "schoolPackage", "booking", "equipment", "event"];

const infoPaths = ["/info", "/info/students", "/info/teachers", "/info/bookings", "/info/equipments", "/info/packages", "/info/lessons"];
const INFO_ENTITIES = ["student", "teacher", "schoolPackage", "booking", "equipment", "lesson", "event"];

export const NavLeft = () => {
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isInfoDropdownOpen, setIsInfoDropdownOpen] = useState(false);

    const databoardEntities = ENTITY_DATA.filter((entity) => DATABOARD_ENTITIES.includes(entity.id));
    const databoardDropdownItems: DropdownItemProps[] = databoardEntities.map((entity) => ({
        id: entity.id,
        label: entity.name,
        href: entity.link,
        icon: entity.icon,
        color: entity.color,
    }));

    const infoEntities = ENTITY_DATA.filter((entity) => INFO_ENTITIES.includes(entity.id));
    const infoDropdownItems: DropdownItemProps[] = infoEntities.map((entity) => ({
        id: `info-${entity.id}`,
        label: entity.name,
        href: `/info${entity.link}`,
        icon: entity.icon,
        color: entity.color,
    }));

    const activeDropdownItem = databoardDropdownItems.find((item) => item.href && pathname.startsWith(item.href));
    const activeInfoDropdownItem = infoDropdownItems.find((item) => item.href && pathname.startsWith(item.href));

    return (
        <div className="flex items-center gap-1">
            <Link href="/" className="flex items-center">
                <AdranlinkIcon size={40} className="text-secondary" />
            </Link>
            {FACEBOOK_NAV_ROUTES.map((route) => {
                let isActive = false;
                if (route.id === "data") {
                    isActive = databoardPaths.some(path => pathname.startsWith(path));
                } else if (route.id === "info") {
                    isActive = infoPaths.some(path => pathname.startsWith(path));
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
                            <Dropdown
                                isOpen={isDropdownOpen}
                                onClose={() => setIsDropdownOpen(false)}
                                items={databoardDropdownItems}
                                align="center"
                                initialFocusedId={activeDropdownItem?.id}
                            />
                        </div>
                    );
                }

                if (route.id === "info") {
                    return (
                        <div key={route.href} className="relative">
                            <DropdownItem
                                item={{
                                    icon: route.icon,
                                    active: isActive,
                                    onClick: () => setIsInfoDropdownOpen(!isInfoDropdownOpen),
                                }}
                                variant="nav"
                            />
                            <Dropdown
                                isOpen={isInfoDropdownOpen}
                                onClose={() => setIsInfoDropdownOpen(false)}
                                items={infoDropdownItems}
                                align="center"
                                initialFocusedId={activeInfoDropdownItem?.id}
                            />
                        </div>
                    );
                }

                return (
                    <DropdownItem
                        key={route.href}
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
    );
};
