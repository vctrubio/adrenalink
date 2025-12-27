import { TrendingUp, TrendingDown, TrendingUpDown } from "lucide-react";
import { getCompactNumber } from "@/getters/integer-getter";
import { getFullDuration } from "@/getters/duration-getter";
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
import { Bookmark } from "lucide-react";

const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
const lessonEntity = ENTITY_DATA.find((e) => e.id === "lesson")!;
const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission");
const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;
const rentalEntity = ENTITY_DATA.find((e) => e.id === "rental")!;

type StatType =
    | "student"
    | "teacher"
    | "lessons"
    | "events"
    | "duration"
    | "bookings"
    | "commission"
    | "revenue"
    | "schoolNet"
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
        formatter: (value) => getFullDuration(value),
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
        icon: <TrendingUp size={20} />,
        color: "rgb(251, 146, 60)",
        formatter: (value) => getCompactNumber(value),
    },
    schoolNet: {
        icon: <TrendingUpDown size={20} />,
        color: "rgb(251, 146, 60)",
        formatter: (value) => getCompactNumber(value),
    },
    moneyToPay: {
        icon: <TrendingUp size={20} />,
        color: "rgb(251, 146, 60)",
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
            label: label || capitalize(type),
            color: config.color,
        };
    }

    // Handle trending down for negative revenue (booking bank logic)
    if (type === "revenue" && value < 0) {
        const config = STAT_CONFIGS[type];
        return {
            icon: <TrendingDown size={20} />,
            value: config.formatter(value),
            label: label || capitalize(type),
            color: config.color,
        };
    }

    const config = STAT_CONFIGS[type];
    return {
        icon: config.icon,
        value: config.formatter(value),
        label: label || capitalize(type),
        color: config.color,
    };
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
