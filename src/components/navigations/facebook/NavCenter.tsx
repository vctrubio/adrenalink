"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FACEBOOK_NAV_ROUTES } from "@/config/facebook-nav-routes";
import { ENTITY_DATA } from "@/config/entities";
import { Dropdown, DropdownItem, type DropdownItemProps } from "@/src/components/ui/dropdown";

const databoardPaths = ["/data", "/students", "/teachers", "/bookings", "/equipments", "/packages", "/rentals", "/referrals", "/requests"];
const DATABOARD_ENTITIES = ["student", "teacher", "schoolPackage", "booking", "equipment"];

export const NavCenter = () => {
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const databoardEntities = ENTITY_DATA.filter((entity) => DATABOARD_ENTITIES.includes(entity.id));
    const databoardDropdownItems: DropdownItemProps[] = databoardEntities.map((entity) => ({
        id: entity.id,
        label: entity.name,
        href: entity.link,
        icon: entity.icon,
        color: entity.color,
    }));

    return (
        <div className="hidden md:flex items-center justify-center gap-1">
            {FACEBOOK_NAV_ROUTES.map((route) => {
                let isActive = false;
                if (route.id === 'data') {
                    isActive = databoardPaths.some(path => pathname.startsWith(path));
                } else if (route.id === 'home') {
                    isActive = pathname === route.href;
                } else {
                    isActive = pathname.startsWith(route.href);
                }

                if (route.id === 'data') {
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
