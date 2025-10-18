import AdminIcon from "../public/appSvgs/AdminIcon.jsx";
import BookingIcon from "../public/appSvgs/BookingIcon.jsx";
import CreditIcon from "../public/appSvgs/CreditIcon.jsx";
import EquipmentIcon from "../public/appSvgs/EquipmentIcon.jsx";
import FlagIcon from "../public/appSvgs/FlagIcon.jsx";
import HeadsetIcon from "../public/appSvgs/HeadsetIcon.jsx";
import HelmetIcon from "../public/appSvgs/HelmetIcon.jsx";
import KiteIcon from "../public/appSvgs/KiteIcon.jsx";
import PackageIcon from "../public/appSvgs/PackageIcon.jsx";
import RegistrationIcon from "../public/appSvgs/RegistrationIcon.jsx";

export const ENTITY_DATA = [
    {
        id: "School",
        name: "Schools",
        icon: AdminIcon,
        color: "text-indigo-500",
        bgColor: "bg-indigo-300",
        hoverColor: "#e0e7ff", // indigo-100
        link: "/schools",
        description: ["Central entity that organizes all activities.", "Contains teachers, packages, and bookings."],
    },
    {
        id: "Student",
        name: "Students",
        icon: HelmetIcon,
        color: "text-yellow-500",
        bgColor: "bg-yellow-300",
        hoverColor: "#fef3c7", // yellow-100
        link: "/students",
        description: ["Students create bookings.", "Can participate in multiple lessons through bookings."],
    },
    {
        id: "School Package",
        name: "Packages",
        icon: PackageIcon,
        color: "text-orange-500",
        bgColor: "bg-orange-300",
        hoverColor: "#fed7aa", // orange-100
        link: "/packages",
        description: ["Determines duration, capacity, and equipment for bookings.", "Defines pricing and availability."],
    },
    {
        id: "Booking",
        name: "Bookings",
        icon: BookingIcon,
        color: "text-blue-500",
        bgColor: "bg-blue-300",
        hoverColor: "#dbeafe", // blue-100
        link: "/bookings",
        description: ["Has start and end dates for lessons.", "Links students to packages."],
    },
    {
        id: "Teacher",
        name: "Teachers",
        icon: HeadsetIcon,
        color: "text-green-500",
        bgColor: "bg-green-300",
        hoverColor: "#d1fae5", // green-100
        link: "/teachers",
        description: ["Our employees, each has commission rates for lessons.", "Payments are used to track earnings."],
    },
    {
        id: "Commission",
        name: "Commissions",
        icon: CreditIcon,
        color: "text-emerald-500",
        bgColor: "bg-emerald-300",
        hoverColor: "#d1fae5", // emerald-100
        link: "/commissions",
        description: ["Defines commission rates for teachers.", "Can be percentage or fixed amount."],
    },
    {
        id: "Equipment",
        name: "Equipments",
        icon: EquipmentIcon,
        color: "text-purple-500",
        bgColor: "bg-purple-300",
        hoverColor: "#e9d5ff", // purple-100
        link: "/equipment",
        description: ["Kites, wings, and other gear used in lessons.", "Tracked for usage in each event."],
    },
    {
        id: "User Wallet",
        name: "Users",
        icon: RegistrationIcon,
        color: "text-slate-500",
        bgColor: "bg-slate-300",
        hoverColor: "#f1f5f9", // slate-100
        link: "/users",
        description: ["Links users to teachers and defines roles.", "Manages user authentication and permissions."],
    },
    {
        id: "Lesson",
        name: "Lessons",
        icon: FlagIcon,
        color: "text-cyan-500",
        bgColor: "bg-cyan-300",
        hoverColor: "#cffafe", // cyan-100
        link: "/lessons",
        description: ["Represents a scheduled lesson.", "Links teacher, booking, and commission."],
    },
    {
        id: "Event",
        name: "Events",
        icon: KiteIcon,
        color: "text-teal-500",
        bgColor: "bg-teal-300",
        hoverColor: "#ccfbf1", // teal-100
        link: "/events",
        description: ["Actual lesson occurrence with duration and location.", "Tracks equipment usage during the lesson."],
    },
    {
        id: "Payment",
        name: "Payments",
        icon: CreditIcon,
        color: "text-amber-500",
        bgColor: "bg-amber-300",
        hoverColor: "#fef3c7", // amber-100
        link: "/payments",
        description: ["Records payments made to teachers.", "Tracks teacher earnings and compensation."],
    },
] as const;
