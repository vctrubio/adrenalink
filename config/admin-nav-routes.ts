import { MessageSquare, BarChart3 } from "lucide-react";
import { ENTITY_DATA } from "./entities";
import AdranlinkIcon from "../public/appSvgs/AdranlinkIcon.jsx";
import AdminIcon from "../public/appSvgs/AdminIcon.jsx";
import TransactionIcon from "../public/appSvgs/TransactionIcon.jsx";
import HelmetIcon from "../public/appSvgs/HelmetIcon.jsx";
import SubscriptionIcon from "../public/appSvgs/SubscriptionIcon.jsx";
import A2Icon from "../public/appSvgs/A2Icon.jsx";

export type AdminNavRoute = {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    children?: AdminNavRoute[];
    count?: number;
    color?: string;
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
        color: entity.color,
    }));
};

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
    {
        section: "head",
        routes: [
            {
                name: "Domain",
                href: "/admin/domain",
                icon: AdranlinkIcon,
            },
            {
                name: "Classboard",
                href: "/admin",
                icon: A2Icon,
            },
            {
                name: "Stats",
                href: "/stats",
                icon: BarChart3,
            },
        ],
    },
    {
        section: "middle",
        routes: [
            {
                name: "School",
                href: "#",
                icon: AdminIcon,
                children: [...getEntityByIds(["student", "teacher", "booking", "equipment"])],
            },
            {
                name: "Transaction",
                href: "#",
                icon: TransactionIcon,
                children: [...getEntityByIds(["studentPackage", "rental", "referral", "payment"])],
            },
        ],
    },
    {
        section: "toes",
        routes: [
            {
                name: "Subscription",
                href: "/subscription",
                icon: SubscriptionIcon,
            },
            {
                name: "Feedback",
                href: "/feedback",
                icon: MessageSquare,
            },
        ],
    },
];
