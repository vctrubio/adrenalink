"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FACEBOOK_NAV_ROUTES } from "@/config/facebook-nav-routes";

const databoardPaths = ["/data", "/students", "/teachers", "/bookings", "/equipments", "/packages", "/rentals", "/referrals", "/requests"];

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
