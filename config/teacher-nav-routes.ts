import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { ENTITY_DATA } from "./entities";

export interface UserNavRoute {
	name: string;
	href: string;
}

export const TEACHER_NAV_ROUTES: UserNavRoute[] = [
	{ name: "Home", href: "" },
	{ name: "Lessons", href: "/lesson" },
	{ name: "Commissions", href: "/commission" },
	{ name: "Equipment", href: "/equipment" },
	{ name: "Events", href: "/events" },
	{ name: "Settings", href: "/settings" },
];

// Get teacher entity config
const teacherEntity = ENTITY_DATA.find((entity) => entity.id === "teacher");

// Teacher dropdown has the same items as tabs
export const getTeacherDropdownItems = () => {
	return TEACHER_NAV_ROUTES.map((route) => ({
		id: route.name.toLowerCase(),
		label: route.name,
		href: route.href,
		icon: teacherEntity?.icon || HelmetIcon,
		color: teacherEntity?.color || "#3b82f6",
	}));
};
