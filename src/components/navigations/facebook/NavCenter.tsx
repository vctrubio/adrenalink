"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FACEBOOK_NAV_ROUTES } from "@/config/facebook-nav-routes";
import { ENTITY_DATA } from "@/config/entities";
import { Dropdown, type DropdownItem } from "@/src/components/ui/dropdown";

const databoardPaths = ["/data", "/students", "/teachers", "/bookings", "/equipments", "/packages", "/rentals", "/referrals", "/requests"];
const DATABOARD_ENTITIES = ["student", "teacher", "schoolPackage", "booking", "equipment"];

const NavIcon = ({ href, icon: Icon, active = false }: { href: string; icon: React.ElementType; active?: boolean }) => (
    <Link
        href={href}
        className={`relative flex h-14 w-24 items-center justify-center text-muted-foreground transition-colors hover:bg-accent rounded-lg ${
            active ? "text-primary" : ""
        }`}
    >
        <Icon className={`h-7 w-7 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
        {active && <div className="absolute bottom-0 h-1 w-full bg-primary"></div>}
    </Link>
);

export const NavCenter = () => {
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const databoardEntities = ENTITY_DATA.filter((entity) => DATABOARD_ENTITIES.includes(entity.id));
    const databoardDropdownItems: DropdownItem[] = databoardEntities.map((entity) => ({
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
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`relative flex h-14 w-24 items-center justify-center text-muted-foreground transition-colors hover:bg-accent rounded-lg ${
                                    isActive ? "text-primary" : ""
                                }`}
                            >
                                <route.icon className={`h-7 w-7 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                {isActive && <div className="absolute bottom-0 h-1 w-full bg-primary"></div>}
                            </button>
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
                    <NavIcon
                        key={route.href}
                        href={route.href}
                        icon={route.icon}
                        active={isActive}
                    />
                );
            })}
        </div>
    );
};
