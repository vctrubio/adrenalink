import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import LessonIcon from "@/public/appSvgs/LessonIcon";

export const STUDENT_NAV_ITEMS = [
    {
        id: "home",
        label: "Home",
        icon: AdranlinkIcon,
        path: "",
        gradient: "from-blue-500 to-cyan-400",
    },
    {
        id: "events",
        label: "Events",
        icon: FlagIcon,
        path: "/events",
        gradient: "from-purple-500 to-pink-400",
    },
    {
        id: "bookings",
        label: "Bookings",
        icon: BookingIcon,
        path: "/bookings",
        gradient: "from-orange-500 to-amber-400",
    },
    {
        id: "payments",
        label: "Payments",
        icon: CreditIcon,
        path: "/payments",
        gradient: "from-green-500 to-emerald-400",
    },
];

export const TEACHER_NAV_ITEMS = [
    {
        id: "home",
        label: "Home",
        icon: AdranlinkIcon,
        path: "",
        gradient: "from-blue-500 to-cyan-400",
    },
    {
        id: "events",
        label: "Events",
        icon: FlagIcon,
        path: "/events",
        gradient: "from-purple-500 to-pink-400",
    },
    {
        id: "lessons",
        label: "Lessons",
        icon: LessonIcon,
        path: "/lessons",
        gradient: "from-indigo-500 to-violet-400",
    },
    {
        id: "payments",
        label: "Payments",
        icon: CreditIcon,
        path: "/payments",
        gradient: "from-green-500 to-emerald-400",
    },
];
