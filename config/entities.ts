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
import RequestIcon from "../public/appSvgs/RequestIcon.jsx";
import VerifiedIcon from "../public/appSvgs/VerifiedIcon.jsx";
import LinkIcon from "../public/appSvgs/LinkIcon.jsx";
import RepairIcon from "../public/appSvgs/RepairIcon.jsx";

export type EntityConfig = {
    id: string;
    name: string;
    icon: React.ComponentType<any>;
    color: string;
    bgColor: string;
    link: string;
    description: string[];
    relations: string[]; // Related entity IDs
};

export const ENTITY_DATA: EntityConfig[] = [
    {
        id: "school",
        name: "Schools",
        icon: AdminIcon,
        color: "text-indigo-500",
        bgColor: "bg-indigo-300",
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
        link: "/requests",
        description: ["They request a package"],
        relations: ["student", "schoolPackage", "booking"],
    },
    {
        id: "schoolPackage",
        name: "Packages",
        icon: PackageIcon,
        color: "text-orange-400",
        bgColor: "bg-orange-200",
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
        link: "/bookings",
        description: ["You accept the booking"],
        relations: ["teacher", "student", "schoolPackage", "lesson", "event"],
    },
    {
        id: "lesson",
        name: "Lessons",
        icon: LessonIcon,
        color: "text-sky-300",
        bgColor: "bg-sky-200",
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
        link: "/equipments",
        description: ["Link equipment"],
        relations: ["package", "teacher", "event"],
    },
    {
        id: "payment",
        name: "Payments",
        icon: CreditIcon,
        color: "text-sand-600",
        bgColor: "bg-sand-200",
        link: "/payments",
        description: ["Pay who needs to be paid"],
        relations: ["teacher", "lesson"],
    },
    {
        id: "student_lesson_feedback",
        name: "Feedback",
        icon: VerifiedIcon,
        color: "text-sand-800",
        bgColor: "bg-sand-300",
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
        link: "/users",
        description: ["Links users to teachers and defines roles.", "Manages user authentication and permissions."],
        relations: ["student", "teacher", "school"],
    },
    {
        id: "referral",
        name: "Referrals",
        icon: LinkIcon,
        color: "text-gray-500",
        bgColor: "bg-gray-300",
        link: "/referrals",
        description: ["Tracks referral codes and their associated commissions."],
        relations: ["school", "student_package"],
    },
    {
        id: "rental",
        name: "Rentals",
        icon: HelmetIcon,
        color: "text-red-500",
        bgColor: "bg-red-300",
        link: "/rentals",
        description: ["Manages direct equipment rentals by students."],
        relations: ["student", "equipment"],
    },
    {
        id: "repairs",
        name: "Repairs",
        icon: RepairIcon,
        color: "text-purple-500",
        bgColor: "bg-purple-300",
        link: "/repairs",
        description: ["Logs repair history and costs for equipment."],
        relations: ["equipment"],
    },
] as const;
