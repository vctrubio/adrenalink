import SchoolIcon from "@/public/appSvgs/SchoolIcon.jsx";
import ClassboardIcon from "@/public/appSvgs/ClassboardIcon.jsx";
import TableIcon from "@/public/appSvgs/TableIcon.jsx";
import SendIcon from "@/public/appSvgs/SendIcon.jsx";
import { Users } from "lucide-react";

export const FACEBOOK_NAV_ROUTES = [
    {
        id: "info",
        name: "Info",
        href: "/home",
        icon: SchoolIcon,
    },
    {
        id: "classboard",
        name: "Classboard",
        href: "/classboard",
        icon: ClassboardIcon,
    },
    {
        id: "data",
        name: "Tables",
        href: "/tables",
        icon: TableIcon,
    },
    {
        id: "users",
        name: "Users",
        href: "/register",
        icon: Users,
    },
    {
        id: "invitations",
        name: "Invitations",
        href: "/invitations",
        icon: SendIcon,
    },
];
