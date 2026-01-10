import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { ENTITY_DATA } from "./entities";

export interface UserNavRoute {
    name: string;
    href: string;
}

export const STUDENT_NAV_ROUTES: UserNavRoute[] = [
    { name: "Home", href: "" },
    { name: "Bookings", href: "/booking" },
    { name: "Requests", href: "/request" },
    { name: "Events", href: "/events" },
    { name: "Settings", href: "/settings" },
];

// Get student entity config
const studentEntity = ENTITY_DATA.find((entity) => entity.id === "student");

// Student dropdown has the same items as tabs
export const getStudentDropdownItems = () => {
    return STUDENT_NAV_ROUTES.map((route) => ({
        id: route.name.toLowerCase(),
        label: route.name,
        href: route.href,
        icon: studentEntity?.icon || HelmetIcon,
        color: studentEntity?.color || "#3b82f6",
    }));
};
