"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FACEBOOK_NAV_ROUTES } from "@/config/facebook-nav-routes";
import { ENTITY_DATA } from "@/config/entities";

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

const DataboardDropdown = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const databoardEntities = ENTITY_DATA.filter((entity) => DATABOARD_ENTITIES.includes(entity.id));

    if (!isOpen) return null;

    return (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg p-2 min-w-56 z-50">
            {databoardEntities.map((entity) => {
                const EntityIcon = entity.icon;
                return (
                    <Link
                        key={entity.id}
                        href={entity.link}
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${entity.color}20`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                        }}
                    >
                        <EntityIcon className="w-5 h-5" style={{ color: entity.color }} />
                        <span className="text-sm font-medium text-foreground">{entity.name}</span>
                    </Link>
                );
            })}
        </div>
    );
};

export const NavCenter = () => {
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
                            <DataboardDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} />
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
