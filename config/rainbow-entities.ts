/**
 * Rainbow Entities - Single source of truth from @docs/manual.md
 * Defines all entities with their rainbow shades, descriptions, schema, and colors
 */

import type { EntityConfig } from "@/types/rainbow-types";
import AdminIcon from "../public/appSvgs/AdminIcon.jsx";
import LinkIcon from "../public/appSvgs/LinkIcon.jsx";
import HelmetIcon from "../public/appSvgs/HelmetIcon.jsx";
import PackageIcon from "../public/appSvgs/PackageIcon.jsx";
import RequestIcon from "../public/appSvgs/RequestIcon.jsx";
import HeadsetIcon from "../public/appSvgs/HeadsetIcon.jsx";
import HandshakeIcon from "../public/appSvgs/HandshakeIcon.jsx";
import BookingIcon from "../public/appSvgs/BookingIcon.jsx";
import LessonIcon from "../public/appSvgs/LessonIcon.jsx";
import FlagIcon from "../public/appSvgs/FlagIcon.jsx";
import EquipmentIcon from "../public/appSvgs/EquipmentIcon.jsx";
import RepairIcon from "../public/appSvgs/RepairIcon.jsx";
import { SchoolDescription } from "@/src/components/rainbow/SchoolDescription";
import { ReferralDescription } from "@/src/components/rainbow/ReferralDescription";
import { RentalDescription } from "@/src/components/rainbow/RentalDescription";
import { SchoolPackageDescription } from "@/src/components/rainbow/SchoolPackageDescription";
import { StudentPackageDescription } from "@/src/components/rainbow/StudentPackageDescription";
import { StudentDescription } from "@/src/components/rainbow/StudentDescription";
import { TeacherDescription } from "@/src/components/rainbow/TeacherDescription";
import { CommissionDescription } from "@/src/components/rainbow/CommissionDescription";
import { BookingDescription } from "@/src/components/rainbow/BookingDescription";
import { LessonDescription } from "@/src/components/rainbow/LessonDescription";
import { EventDescription } from "@/src/components/rainbow/EventDescription";
import { EquipmentDescription } from "@/src/components/rainbow/EquipmentDescription";
import { RepairsDescription } from "@/src/components/rainbow/RepairsDescription";

export const RAINBOW_COLORS: Record<string, { fill: string; hoverFill: string }> = {
    "purple-1": { fill: "#a855f7", hoverFill: "#d946ef" },
    "purple-2": { fill: "#c084fc", hoverFill: "#e879f9" },
    "blue-1": { fill: "#3b82f6", hoverFill: "#1d4ed8" },
    "blue-2": { fill: "#60a5fa", hoverFill: "#93c5fd" },
    "blue-3": { fill: "#93c5fd", hoverFill: "#3b82f6" },
    "green-1": { fill: "#22c55e", hoverFill: "#16a34a" },
    "green-2": { fill: "#4ade80", hoverFill: "#22c55e" },
    "yellow-1": { fill: "#eab308", hoverFill: "#ca8a04" },
    "orange-1": { fill: "#f97316", hoverFill: "#ea580c" },
    "orange-2": { fill: "#fb923c", hoverFill: "#f97316" },
    "red-0": { fill: "#ef4444", hoverFill: "#dc2626" },
    "grey-1": { fill: "#6b7280", hoverFill: "#4b5563" },
    "grey-2": { fill: "#9ca3af", hoverFill: "#6b7280" },
};

export const RAINBOW_ENTITIES: EntityConfig[] = [
    // Grey entities
    {
        id: "school",
        name: "Schools",
        shadeId: "grey-2",
        icon: AdminIcon,
        description: SchoolDescription,
        relations: ["schoolPackage", "teacher", "booking", "equipment"],
        info: {
            schema: {
                username: "string",
                name: "string",
                country: "string",
                currency: "string",
                phone: "string",
                googlePlaceId: "string",
                instagram: "string",
                website: "string",
            },
            rows: [
                [
                    "hostel",
                    "Tarifa Kite Hostel",
                    "Spain",
                    "EUR",
                    "+34 723 828 282",
                    "abcshdd888",
                    "@myfitskitetarifa",
                    "tkhhostel.com",
                ],
            ],
        },
    },
    {
        id: "referral",
        name: "Referrals",
        shadeId: "grey-1",
        icon: LinkIcon,
        description: ReferralDescription,
        info: {
            schema: {
                codeHexa: "string",
                description: "string",
                commission: "string",
            },
            rows: [["WATERMAN69", "Early pack discount for semi private lessons", "10% off"]],
        },
    },

    // Red entities
    {
        id: "rental",
        name: "Rentals",
        shadeId: "red-0",
        icon: HelmetIcon,
        description: RentalDescription,
        relations: ["student", "equipment"],
        info: {
            schema: {
                name: "string",
                date: "string",
                duration: "string",
                equipmentId: "string",
                pph: "string",
            },
            rows: [["Jose", "Nov 14 16:00", "2h", "Reach12", "45"]],
        },
    },

    // Orange entities
    {
        id: "schoolPackage",
        name: "Packages",
        shadeId: "orange-2",
        icon: PackageIcon,
        description: SchoolPackageDescription,
        relations: ["school", "booking", "studentPackage"],
        info: {
            schema: {
                description: "string",
                duration: "string",
                pricePerStudent: "string",
                capacity: "string",
                equipmentCapacity: "string",
                public: "string",
            },
            rows: [["Zero to Hero", "8h", "450", "2", "1 Kite", "Yes"]],
        },
    },
    {
        id: "studentPackage",
        name: "Requests",
        shadeId: "orange-1",
        icon: RequestIcon,
        description: StudentPackageDescription,
        relations: ["student", "schoolPackage", "booking"],
        info: {
            schema: {
                name: "string",
                date: "string",
                package: "string",
            },
            rows: [["Miguel", "24-12-2025 to 28-12-2025", "Zero to Hero"]],
        },
    },

    // Yellow entities
    {
        id: "student",
        name: "Students",
        shadeId: "yellow-1",
        icon: HelmetIcon,
        description: StudentDescription,
        relations: ["schoolPackage", "booking", "event", "rental", "studentPackage"],
        info: {
            schema: {
                fullName: "string",
                country: "string",
                passport: "string",
                languages: "string",
                email: "string",
            },
            rows: [["Miguel Hernansanz", "Spain", "ABC834712", "Spanish & French", "miguelon@gmail.com"]],
        },
    },

    // Green entities
    {
        id: "teacher",
        name: "Teachers",
        shadeId: "green-2",
        icon: HeadsetIcon,
        description: TeacherDescription,
        relations: ["commission", "lesson", "event"],
        info: {
            schema: {
                fullName: "string",
                username: "string",
                languages: "string",
            },
            rows: [["Titor Rito", "titor", "Spanish, French, English"]],
        },
    },
    {
        id: "commission",
        name: "Commissions",
        shadeId: "green-1",
        icon: HandshakeIcon,
        description: CommissionDescription,
        relations: ["teacher"],
        info: {
            schema: {
                username: "string",
                commission: "string",
                description: "string",
            },
            rows: [["lila", "25%", "Commission based"]],
        },
    },

    // Blue entities
    {
        id: "booking",
        name: "Bookings",
        shadeId: "blue-3",
        icon: BookingIcon,
        description: BookingDescription,
        relations: ["student", "schoolPackage", "lesson", "event", "studentPackage"],
        info: {
            schema: {
                dates: "string",
                students: "string",
                package: "string",
                referralCode: "string",
            },
            rows: [["24-12-2025 +4 days", "Miguel", "Zero to Hero", "WATERMAN69"]],
        },
    },
    {
        id: "lesson",
        name: "Lessons",
        shadeId: "blue-2",
        icon: LessonIcon,
        description: LessonDescription,
        relations: ["teacher", "booking", "event"],
        info: {
            schema: {
                teacher: "string",
                commission: "string",
                bookingId: "string",
            },
            rows: [["Isabel", "21%", "bcd456"]],
        },
    },
    {
        id: "event",
        name: "Events",
        shadeId: "blue-1",
        icon: FlagIcon,
        description: EventDescription,
        relations: ["booking", "student", "teacher", "equipment"],
        info: {
            schema: {
                date: "string",
                duration: "string",
                students: "string",
                teacher: "string",
                equipment: "string",
                status: "string",
            },
            rows: [["Dec 24 16:00", "2h", "Miguelon", "titor", "Reach 8m", "Completed"]],
        },
    },

    // Purple entities
    {
        id: "equipment",
        name: "Equipment",
        shadeId: "purple-2",
        icon: EquipmentIcon,
        description: EquipmentDescription,
        relations: ["event", "repairs", "rental"],
        info: {
            schema: {
                name: "string",
                type: "string",
                status: "string",
                condition: "string",
            },
            rows: [["Reach 12m", "Kite", "Active", "Good"]],
        },
    },
    {
        id: "repairs",
        name: "Repairs",
        shadeId: "purple-1",
        icon: RepairIcon,
        description: RepairsDescription,
        relations: ["equipment"],
        info: {
            schema: {
                date: "string",
                price: "string",
                description: "string",
            },
            rows: [["Dec 25", "75", "Leading edge repair"]],
        },
    },
];
