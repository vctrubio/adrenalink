import AdminIcon from "../public/appSvgs/AdminIcon.jsx";
import BookingIcon from "../public/appSvgs/BookingIcon.jsx";
import BookingCompleteIcon from "../public/appSvgs/BookingCompleteIcon.jsx";
import CreditIcon from "../public/appSvgs/CreditIcon.jsx";
import EquipmentIcon from "../public/appSvgs/EquipmentIcon.jsx";
import FlagIcon from "../public/appSvgs/FlagIcon.jsx";
import HandshakeIcon from "../public/appSvgs/HandshakeIcon.jsx";
import HeadsetIcon from "../public/appSvgs/HeadsetIcon.jsx";
import HelmetIcon from "../public/appSvgs/HelmetIcon.jsx";
import LessonIcon from "../public/appSvgs/LessonIcon.jsx";
import PackageIcon from "../public/appSvgs/PackageIcon.jsx";
import RegistrationIcon from "../public/appSvgs/RegistrationIcon.jsx";
import RequestIcon from "../public/appSvgs/RequestIcon.jsx";
import VerifiedIcon from "../public/appSvgs/VerifiedIcon.jsx";
import OctagonIcon from "../public/appSvgs/OctagonIcon.jsx";

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
        description: ["This is you, you sign up."],
        relations: ["schoolPackage", "student", "teacher", "booking", "equipment"],
    },
    {
        id: "student",
        name: "Students",
        icon: HelmetIcon,
        color: "text-yellow-500",
        bgColor: "bg-yellow-300",
        hoverColor: "#fef3c7",
        link: "/students",
        description: ["Students registers"],
        relations: ["schoolPackage", "booking", "event"],
    },
    {
        id: "studentPackage",
        name: "Requests",
        icon: RequestIcon,
        color: "text-amber-500",
        bgColor: "bg-amber-300",
        hoverColor: "#fef9c3",
        link: "/request",
        description: ["They request a package"],
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
        description: ["Set your packages"],
        relations: ["school", "booking"],
    },
    {
        id: "teacher",
        name: "Teachers",
        icon: HeadsetIcon,
        color: "text-green-500",
        bgColor: "bg-green-300",
        hoverColor: "#d1fae5",
        link: "/teachers",
        description: ["Create teachers"],
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
        description: ["Give them comission based salaries"],
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
        description: ["You accept the booking"],
        relations: ["teacher", "student", "schoolPackage", "lesson", "event"],
    },
    {
        id: "lesson",
        name: "Lessons",
        icon: LessonIcon,
        color: "text-foreground",
        bgColor: "bg-foreground-300",
        hoverColor: "#e0e7ff",
        link: "/lessons",
        description: ["Assign a teacher to booking"],
        relations: ["student", "teacher", "event"],
    },
    {
        id: "event",
        name: "Events",
        icon: FlagIcon,
        color: "text-cyan-500",
        bgColor: "bg-cyan-300",
        hoverColor: "#e0e7ff",
        link: "/events",
        description: ["Make events"],
        relations: ["booking", "student", "teacher", "equipment"],
    },
    {
        id: "equipment",
        name: "Equipments",
        icon: EquipmentIcon,
        color: "text-purple-500",
        bgColor: "bg-purple-300",
        hoverColor: "#e9d5ff",
        link: "/equipment",
        description: ["Link equipment"],
        relations: ["package", "teacher", "event"],
    },
    {
        id: "payment",
        name: "Payments",
        icon: CreditIcon,
        color: "text-sand-600",
        bgColor: "bg-sand-200",
        hoverColor: "#fef3c7",
        link: "/payments",
        description: ["Pay who needs to be paid"],
        relations: ["teacher", "lesson"],
    },
    {
        id: "feedback",
        name: "Feedback",
        icon: VerifiedIcon,
        color: "text-sand-800",
        bgColor: "bg-sand-300",
        hoverColor: "#fef3c7",
        link: "/feedback",
        description: ["Get confirmation of hours"],
        relations: ["student", "teacher", "event"],
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
        relations: ["student", "teacher", "school"],
    },
] as const;
