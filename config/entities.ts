import AdminIcon from "../public/appSvgs/AdminIcon.jsx";
import BookingIcon from "../public/appSvgs/BookingIcon.jsx";
import CreditIcon from "../public/appSvgs/CreditIcon.jsx";
import EquipmentIcon from "../public/appSvgs/EquipmentIcon.jsx";
import FlagIcon from "../public/appSvgs/FlagIcon.jsx";
import HandshakeIcon from "../public/appSvgs/HandshakeIcon.jsx";
import HeadsetIcon from "../public/appSvgs/HeadsetIcon.jsx";
import HelmetIcon from "../public/appSvgs/HelmetIcon.jsx";
import LessonIcon from "../public/appSvgs/LessonIcon.jsx";
import PackageIcon from "../public/appSvgs/PackageIcon.jsx";
import RegistrationIcon from "../public/appSvgs/RegistrationIcon.jsx";

export type EntityConfig = {
    id: string;
    name: string;
    icon: React.ComponentType<any>;
    color: string;
    bgColor: string;
    hoverColor: string;
    link: string;
    description: string[];
    relations: string[]; // Related entity IDs
    count?: number;
};

export const ENTITY_DATA: EntityConfig[] = [
    {
        id: "school",
        name: "Schools",
        icon: AdminIcon,
        color: "text-indigo-500",
        bgColor: "bg-indigo-300",
        hoverColor: "#e0e7ff",
        link: "/schools",
        description: ["Central entity that organizes all activities.", "Contains teachers, packages, and bookings."],
        relations: ["student", "teacher", "booking", "equipment"],
    },
    {
        id: "student",
        name: "Students",
        icon: HelmetIcon,
        color: "text-yellow-500",
        bgColor: "bg-yellow-300",
        hoverColor: "#fef3c7",
        link: "/students",
        description: ["Students create bookings.", "Can participate in multiple lessons through bookings."],
        relations: ["schoolPackage", "booking", "event"],
    },
    {
        id: "studentPackage",
        name: "Student Packages",
        icon: PackageIcon,
        color: "text-amber-500",
        bgColor: "bg-amber-300",
        hoverColor: "#fef9c3",
        link: "/request",
        description: ["Student requests a package on the school subdomain.", "Admin receives booking and verifies the dates and status."],
        relations: ["student", "schoolPackage", "booking"],
    },
    {
        id: "schoolPackage",
        name: "Packages",
        icon: PackageIcon,
        color: "text-orange-400",
        bgColor: "bg-orange-200",
        hoverColor: "#ffedd5",
        link: "/packages",
        description: ["Determines duration, capacity, and equipment for bookings.", "Defines pricing and availability."],
        relations: ["student", "booking", "event"],
    },
    {
        id: "teacher",
        name: "Teachers",
        icon: HeadsetIcon,
        color: "text-green-500",
        bgColor: "bg-green-300",
        hoverColor: "#d1fae5",
        link: "/teachers",
        description: ["Our employees, each has commission rates for lessons.", "Payments are used to track earnings."],
        relations: ["commission", "lesson", "equipment"],
    },
    {
        id: "commission",
        name: "Commissions",
        icon: HandshakeIcon,
        color: "text-emerald-500",
        bgColor: "bg-emerald-300",
        hoverColor: "#d1fae5",
        link: "/commissions",
        description: ["Defines commission rates for teachers.", "Can be percentage or fixed amount."],
        relations: ["teacher"],
    },
    {
        id: "booking",
        name: "Bookings",
        icon: BookingIcon,
        color: "text-blue-500",
        bgColor: "bg-blue-300",
        hoverColor: "#dbeafe",
        link: "/bookings",
        description: ["Has start and end dates for lessons.", "Links students to packages."],
        relations: ["teacher", "student", "schoolPackage", "lesson", "event"],
    },
    {
        id: "lesson",
        name: "Lessons",
        icon: LessonIcon,
        color: "text-cyan-500",
        bgColor: "bg-cyan-300",
        hoverColor: "#cffafe",
        link: "/lessons",
        description: ["Represents a scheduled lesson.", "Links teacher, booking, and commission."],
        relations: ["student", "teacher", "event"],
    },
    {
        id: "event",
        name: "Events",
        icon: FlagIcon,
        color: "text-metal-700", //metal dark mate
        bgColor: "bg-metal-400",
        hoverColor: "#e0e7ff",
        link: "/events",
        description: ["Actual lesson occurrence with duration and location.", "Tracks equipment usage during the lesson."],
        relations: ["student", "teacher", "equipment"],
    },
    {
        id: "equipment",
        name: "Equipments",
        icon: EquipmentIcon,
        color: "text-purple-500",
        bgColor: "bg-purple-300",
        hoverColor: "#e9d5ff",
        link: "/equipment",
        description: ["Kites, wings, and other gear used in lessons.", "Tracked for usage in each event."],
        relations: ["teacher", "student", "event"],
    },
    {
        id: "payment",
        name: "Payments",
        icon: CreditIcon,
        color: "text-sand-600",
        bgColor: "bg-sand-200",
        hoverColor: "#fef3c7",
        link: "/payments",
        description: ["Records payments made to teachers.", "Tracks teacher earnings and compensation."],
        relations: ["teacher"],
    },
    {
        id: "userWallet",
        name: "Users",
        icon: RegistrationIcon,
        color: "text-slate-500",
        bgColor: "bg-slate-300",
        hoverColor: "#f1f5f9",
        link: "/users",
        description: ["Links users to teachers and defines roles.", "Manages user authentication and permissions."],
        relations: ["teacher"],
    },
] as const;
