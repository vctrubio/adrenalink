import { MessageSquare, BarChart3, FormInputIcon, PartyPopperIcon } from "lucide-react";
import { ENTITY_DATA } from "./entities";
import AdranlinkIcon from "../public/appSvgs/AdranlinkIcon.jsx";
import HelmetIcon from "../public/appSvgs/HelmetIcon.jsx";
import SubscriptionIcon from "../public/appSvgs/SubscriptionIcon.jsx";
import A2Icon from "../public/appSvgs/A2Icon.jsx";

export type AdminNavRoute = {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    count?: number;
    color?: string;
};

export type AdminNavGroup = {
    groupLabel: string;
    routes: AdminNavRoute[];
};

export type AdminNavSection = {
    section: "main" | "groups" | "settings" | "support";
    routes?: AdminNavRoute[]; // For main section (no group label)
    groups?: AdminNavGroup[]; // For grouped sections
};

const getEntityByIds = (ids: string[]) => {
    return ENTITY_DATA.filter((entity) => ids.includes(entity.id)).map((entity) => ({
        name: entity.name,
        href: entity.link,
        icon: entity.icon,
        color: entity.color,
    }));
};

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
    // MAIN - Domain and Check-in
    {
        section: "main",
        routes: [
            {
                name: "Domain",
                href: "/domain",
                icon: AdranlinkIcon,
            },
            { name: "Check-in", href: "/register", icon: FormInputIcon },
        ],
    },
    // OPERATIONS - Classboard and Stats
    {
        section: "groups",
        groups: [
            {
                groupLabel: "OPERATIONS",
                routes: [
                    {
                        name: "Classboard",
                        href: "/classboard",
                        icon: A2Icon,
                    },
                    {
                        name: "Stats",
                        href: "/stats",
                        icon: BarChart3,
                    },
                ],
            },
            // TABLES - Entity management
            {
                groupLabel: "TABLES",
                routes: getEntityByIds(["student", "teacher", "booking", "equipment", "schoolPackage", "rental", "studentPackage", "referral"]),
            },
        ],
    },
    // SETTINGS - Subscription and Users
    {
        section: "settings",
        groups: [
            {
                groupLabel: "SETTINGS",
                routes: [
                    {
                        name: "Subscription",
                        href: "/subscription",
                        icon: SubscriptionIcon,
                    },
                    {
                        name: "Invitations",
                        href: "/invitations",
                        icon: PartyPopperIcon,
                    },
                ],
            },
        ],
    },
    // SUPPORT - Feedback
    {
        section: "support",
        groups: [
            {
                groupLabel: "SUPPORT",
                routes: [
                    {
                        name: "Feedback",
                        href: "/feedback",
                        icon: MessageSquare,
                    },
                ],
            },
        ],
    },
];
