import { Home, Globe, ArrowLeftRight, Package, CreditCard, MessageSquare } from "lucide-react";
import { ENTITY_DATA } from "./entities";
import HomeAdminIcon from "../public/appSvgs/HomeAdminIcon.jsx";

export type AdminNavRoute = {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    children?: AdminNavRoute[];
    count?: number;
};

export type AdminNavSection = {
    section: "head" | "middle" | "toes";
    routes: AdminNavRoute[];
};

const getEntityByIds = (ids: string[]) => {
    return ENTITY_DATA.filter((entity) => ids.includes(entity.id)).map((entity) => ({
        name: entity.name,
        href: entity.link,
        icon: entity.icon,
    }));
};

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
    {
        section: "head",
        routes: [
            {
                name: "Home",
                href: "/admin",
                icon: Home,
            },
            {
                name: "Domain",
                href: "/admin/domain",
                icon: Globe,
            },
        ],
    },
    {
        section: "middle",
        routes: [
            {
                name: "School",
                href: "#",
                icon: HomeAdminIcon,
                children: [
                    ...getEntityByIds(["student", "teacher", "event", "equipment", "repairs"]),
                ],
            },
            {
                name: "Transaction",
                href: "#",
                icon: ArrowLeftRight,
                children: [
                    ...getEntityByIds(["studentPackage", "booking", "referral"]),
                ],
            },
        ],
    },
    {
        section: "toes",
        routes: [
            {
                name: "Rentals",
                href: "/admin/rentals",
                icon: Package,
            },
            {
                name: "Subscription",
                href: "/admin/subscription",
                icon: CreditCard,
            },
            {
                name: "Feedback",
                href: "/admin/feedback",
                icon: MessageSquare,
            },
        ],
    },
];
