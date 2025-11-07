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
        color: "#6366f1",
        bgColor: "#a5b4fc",
        link: "/schools",
        description: ["This is you, you sign up."],
        relations: ["schoolPackage", "student", "teacher", "booking", "equipment"],
    },
    {
        id: "student",
        name: "Students",
        icon: HelmetIcon,
        color: "#eab308",
        bgColor: "#fcd34d",
        link: "/students",
        description: ["Students registers"],
        relations: ["schoolPackage", "booking", "event"],
    },
    {
        id: "studentPackage",
        name: "Requests",
        icon: RequestIcon,
        color: "#f59e0b",
        bgColor: "#fcd34d",
        link: "/requests",
        description: ["They request a package"],
        relations: ["student", "schoolPackage", "booking"],
    },
    {
        id: "schoolPackage",
        name: "Packages",
        icon: PackageIcon,
        color: "#fb923c",
        bgColor: "#fed7aa",
        link: "/packages",
        description: ["Set your packages"],
        relations: ["school", "booking"],
    },
    {
        id: "teacher",
        name: "Teachers",
        icon: HeadsetIcon,
        color: "#22c55e",
        bgColor: "#86efac",
        link: "/teachers",
        description: ["Create teachers"],
        relations: ["commission", "lesson", "equipment"],
    },
    {
        id: "commission",
        name: "Commissions",
        icon: HandshakeIcon,
        color: "#10b981",
        bgColor: "#6ee7b7",
        link: "/commissions",
        description: ["Give them comission based salaries"],
        relations: ["teacher"],
    },
    {
        id: "booking",
        name: "Bookings",
        icon: BookingIcon,
        color: "#3b82f6",
        bgColor: "#93c5fd",
        link: "/bookings",
        description: ["You accept the booking"],
        relations: ["teacher", "student", "schoolPackage", "lesson", "event"],
    },
    {
        id: "lesson",
        name: "Lessons",
        icon: LessonIcon,
        color: "#7dd3fc",
        bgColor: "#bae6fd",
        link: "/lessons",
        description: ["Assign a teacher to booking"],
        relations: ["student", "teacher", "event", "booking", "payment"],
    },
    {
        id: "event",
        name: "Events",
        icon: FlagIcon,
        color: "#06b6d4",
        bgColor: "#67e8f9",
        link: "/events",
        description: ["Make events"],
        relations: ["booking", "student", "teacher", "equipment"],
    },
    {
        id: "equipment",
        name: "Equipments",
        icon: EquipmentIcon,
        color: "#a855f7",
        bgColor: "#d8b4fe",
        link: "/equipments",
        description: ["Link equipment"],
        relations: ["package", "teacher", "event"],
    },
    {
        id: "payment",
        name: "Payments",
        icon: CreditIcon,
        color: "#78716c",
        bgColor: "#e7e5e4",
        link: "/payments",
        description: ["Pay who needs to be paid"],
        relations: ["teacher", "lesson"],
    },
    {
        id: "student_lesson_feedback",
        name: "Feedback",
        icon: VerifiedIcon,
        color: "#57534e",
        bgColor: "#d6d3d1",
        link: "/feedback",
        description: ["Get confirmation of hours"],
        relations: ["student", "teacher", "event"],
    },
    {
        id: "userWallet",
        name: "Users",
        icon: RegistrationIcon,
        color: "#64748b",
        bgColor: "#cbd5e1",
        link: "/users",
        description: ["Links users to teachers and defines roles.", "Manages user authentication and permissions."],
        relations: ["student", "teacher", "school"],
    },
    {
        id: "referral",
        name: "Referrals",
        icon: LinkIcon,
        color: "#e5e7eb",
        bgColor: "#f3f4f6",
        link: "/referrals",
        description: ["Tracks referral codes and their associated commissions."],
        relations: ["school", "student_package"],
    },
    {
        id: "rental",
        name: "Rentals",
        icon: HelmetIcon,
        color: "#ef4444",
        bgColor: "#fca5a5",
        link: "/rentals",
        description: ["Manages direct equipment rentals by students."],
        relations: ["student", "equipment"],
    },
    {
        id: "repairs",
        name: "Repairs",
        icon: RepairIcon,
        color: "#a855f7",
        bgColor: "#d8b4fe",
        link: "/repairs",
        description: ["Logs repair history and costs for equipment."],
        relations: ["equipment"],
    },
] as const;
