import { TrendingUp, TrendingDown, TrendingUpDown } from "lucide-react";
import { getCompactNumber } from "@/getters/integer-getter";
import { getHMDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import type { StatItem } from "@/src/components/ui/row";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";
import CreditIcon from "@/public/appSvgs/CreditIcon";
import RequestIcon from "@/public/appSvgs/RequestIcon";
import { Bookmark } from "lucide-react";

const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
const studentPackageEntity = ENTITY_DATA.find((e) => e.id === "studentPackage")!;
const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
const lessonEntity = ENTITY_DATA.find((e) => e.id === "lesson")!;
const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission");
const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;
const rentalEntity = ENTITY_DATA.find((e) => e.id === "rental")!;
const paymentEntity = ENTITY_DATA.find((e) => e.id === "payment");

type StatType =
    | "student"
    | "studentPackage"
    | "teacher"
    | "lessons"
    | "events"
    | "duration"
    | "bookings"
    | "commission"
    | "revenue"
    | "expenses"
    | "profit"
    | "moneyToPay"
    | "moneyPaid"
    | "rentals"
    | "package"
    | "equipment";

interface StatConfig {
    icon: React.ReactNode;
    color: string;
    formatter: (value: number) => string | number;
}

const STAT_CONFIGS: Record<StatType, StatConfig> = {
    student: {
        icon: <HelmetIcon />,
        color: studentEntity.color,
        formatter: (value) => value,
    },
    studentPackage: {
        icon: <RequestIcon />,
        color: studentPackageEntity.color,
        formatter: (value) => value,
    },
    teacher: {
        icon: <HeadsetIcon />,
        color: teacherEntity.color,
        formatter: (value) => value,
    },
    lessons: {
        icon: <LessonIcon />,
        color: lessonEntity.color,
        formatter: (value) => value,
    },
    events: {
        icon: <FlagIcon />,
        color: eventEntity.color,
        formatter: (value) => value,
    },
    duration: {
        icon: <DurationIcon />,
        color: "#4b5563",
        formatter: (value) => getHMDuration(value),
    },
    bookings: {
        icon: <BookingIcon />,
        color: bookingEntity.color,
        formatter: (value) => value,
    },
    commission: {
        icon: <HandshakeIcon />,
        color: commissionEntity?.color || "#a78bfa",
        formatter: (value) => getCompactNumber(value),
    },
    revenue: {
        icon: <TrendingUpDown size={20} />,
        color: "rgb(251, 146, 60)",
        formatter: (value) => getCompactNumber(value),
    },
    expenses: {
        icon: <TrendingDown size={20} />,
        color: "rgb(251, 146, 60)",
        formatter: (value) => getCompactNumber(value),
    },
    profit: {
        icon: <TrendingUp size={20} />,
        color: "rgb(251, 146, 60)",
        formatter: (value) => getCompactNumber(value),
    },
    schoolNet: {
        icon: <TrendingUp size={20} />,
        color: "rgb(251, 146, 60)",
        formatter: (value) => getCompactNumber(value),
    },
    moneyToPay: {
        icon: <CreditIcon />,
        color: paymentEntity?.color || "rgb(251, 146, 60)",
        formatter: (value) => getCompactNumber(value),
    },
    moneyPaid: {
        icon: <TrendingUp size={20} />,
        color: "rgb(251, 146, 60)",
        formatter: (value) => getCompactNumber(value),
    },
    rentals: {
        icon: <HelmetIcon className="w-5 h-5" />,
        color: rentalEntity.color,
        formatter: (value) => value,
    },
    package: {
        icon: <Bookmark size={20} />,
        color: packageEntity.color,
        formatter: (value) => value,
    },
    equipment: {
        icon: <EquipmentIcon className="w-5 h-5" />,
        color: equipmentEntity.color,
        formatter: (value) => value,
    },
};

export function createStat(
    type: StatType,
    value: number | string,
    label?: string
): StatItem | null {
    // Handle string values
    if (typeof value === "string") {
        const config = STAT_CONFIGS[type];
        return {
            icon: config.icon,
            value: value,
            label: label || (type === "profit" ? "Profit" : type === "revenue" ? "Revenue" : capitalize(type)),
            color: config.color,
        };
    }

    // Handle trending down for negative profit only (keep orange color)
    if (type === "profit" && value < 0) {
        const config = STAT_CONFIGS[type];
        return {
            icon: <TrendingDown size={20} />,
            value: config.formatter(value),
            label: label || "Profit",
            color: config.color,
        };
    }

    const config = STAT_CONFIGS[type];
    return {
        icon: config.icon,
        value: config.formatter(value as number),
        label: label || (type === "profit" ? "Profit" : type === "revenue" ? "Revenue" : capitalize(type)),
        color: config.color,
    };
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
