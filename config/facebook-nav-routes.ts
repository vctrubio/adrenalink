import SchoolIcon from "@/public/appSvgs/SchoolIcon.jsx";
import ClassboardIcon from "@/public/appSvgs/ClassboardIcon.jsx";
import TableIcon from "@/public/appSvgs/TableIcon.jsx";
import { Users } from "lucide-react";

export const FACEBOOK_NAV_ROUTES = [
    {
        name: "Home",
        href: "/home",
        icon: SchoolIcon,
    },
    {
        name: "Classboard",
        href: "/classboard",
        icon: ClassboardIcon,
    },
    {
        name: "Tables",
        href: "/data",
        icon: TableIcon,
    },
    {
        name: "Users",
        href: "/invitations",
        icon: Users,
    },
];
