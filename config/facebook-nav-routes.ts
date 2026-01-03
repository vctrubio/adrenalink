import SchoolIcon from "@/public/appSvgs/SchoolIcon.jsx";
import ClassboardIcon from "@/public/appSvgs/ClassboardIcon.jsx";
import TableIcon from "@/public/appSvgs/TableIcon.jsx";
import { Users, Send } from "lucide-react";

export const FACEBOOK_NAV_ROUTES = [
    {
        id: "info",
        name: "Info",
        href: "/info",
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
        href: "/data",
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
        icon: Send,
    },
];
