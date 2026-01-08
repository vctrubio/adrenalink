import ClassboardIcon from "@/public/appSvgs/ClassboardIcon.jsx";
import TableIcon from "@/public/appSvgs/TableIcon.jsx";
import SendIcon from "@/public/appSvgs/SendIcon.jsx";
import CompassIcon from "@/public/appSvgs/CompassIcon.jsx";
import { Users } from "lucide-react";

export const FACEBOOK_NAV_ROUTES = [
    {
        id: "info",
        label: "Home",
        href: "/home",
        icon: CompassIcon,
    },
    {
        id: "classboard",
        label: "Classboard",
        href: "/classboard",
        icon: ClassboardIcon,
    },
    {
        id: "data",
        label: "Tables",
        href: "/tables",
        icon: TableIcon,
    },
    {
        id: "users",
        label: "Users",
        href: "/register",
        icon: Users,
    },
    {
        id: "invitations",
        label: "Invitations",
        href: "/invitations",
        icon: SendIcon,
    },
];