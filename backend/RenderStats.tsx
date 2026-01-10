import React from "react";
import { TrendingUp, TrendingDown, TrendingUpDown, Bookmark } from "lucide-react";
import { getCompactNumber } from "@/getters/integer-getter";
import { getHMDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
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
import RepairIcon from "@/public/appSvgs/RepairIcon";
import type { DailyLessonStats } from "@/backend/classboard/ClassboardStatistics";

// --- Entity Data & Colors ---
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

// --- Types ---
export type StatType =
    | "student"
    | "students" // Alias for student
    | "studentPackage"
    | "teacher"
    | "teachers" // Alias for teacher
    | "lesson"
    | "lessons"
    | "events"
    | "completed" // Alias/Specific for events
    | "duration"
    | "booking"
    | "bookings"
    | "requests"
    | "commission"
    | "revenue"
    | "receipt"
    | "expenses"
    | "profit"
    | "moneyToPay"
    | "studentPayments"
    | "teacherPayments"
    | "rentals"
    | "package"
    | "equipment"
    | "repairs"
    | "schoolNet";

export interface StatItem {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    color: string;
    // For raw access if needed
    rawValue?: number | string;
}

interface StatConfig {
    icon: React.ComponentType<any> | React.ReactNode;
    color: string;
    formatter: (value: number) => string | number;
    label: string;
}

// --- Configuration ---
export const STAT_CONFIGS: Record<StatType, StatConfig> = {
    student: {
        icon: HelmetIcon,
        color: studentEntity.color,
        formatter: (value) => value,
        label: "Student",
    },
    students: {
        icon: HelmetIcon,
        color: studentEntity.color,
        formatter: (value) => value,
        label: "Students",
    },
    studentPackage: {
        icon: RequestIcon,
        color: studentPackageEntity.color,
        formatter: (value) => value,
        label: "Package",
    },
    teacher: {
        icon: HeadsetIcon,
        color: teacherEntity.color,
        formatter: (value) => value,
        label: "Teacher",
    },
    teachers: {
        icon: HeadsetIcon,
        color: teacherEntity.color,
        formatter: (value) => value,
        label: "Teachers",
    },
    lesson: {
        icon: LessonIcon,
        color: lessonEntity.color,
        formatter: (value) => value,
        label: "Lesson",
    },
    lessons: {
        icon: LessonIcon,
        color: lessonEntity.color,
        formatter: (value) => value,
        label: "Lessons",
    },
    events: {
        icon: FlagIcon,
        color: eventEntity.color,
        formatter: (value) => value,
        label: "Events",
    },
    completed: {
        icon: FlagIcon,
        color: eventEntity.color,
        formatter: (value) => value,
        label: "Completed",
    },
    duration: {
        icon: DurationIcon,
        color: "#4b5563",
        formatter: (value) => getHMDuration(value),
        label: "Duration",
    },
    bookings: {
        icon: BookingIcon,
        color: bookingEntity.color,
        formatter: (value) => value,
        label: "Bookings",
    },
    requests: {
        icon: RequestIcon,
        color: studentPackageEntity.color,
        formatter: (value) => value,
        label: "Requests",
    },
    booking: {
        icon: BookingIcon,
        color: bookingEntity.color,
        formatter: (value) => value,
        label: "Booking",
    },
    commission: {
        icon: HandshakeIcon,
        color: commissionEntity?.color || "#a78bfa",
        formatter: (value) => getCompactNumber(value),
        label: "Commission",
    },
    revenue: {
        icon: <TrendingUpDown size={20} />,
        color: "rgb(251, 146, 60)",
        formatter: (value) => getCompactNumber(value),
        label: "Revenue",
    },
    receipt: {
        icon: CreditIcon,
        color: paymentEntity?.color || "rgb(251, 146, 60)",
        formatter: (value) => getCompactNumber(value),
        label: "Receipt",
    },
    expenses: {
        icon: <TrendingDown size={20} />,
        color: "rgb(251, 146, 60)",
        formatter: (value) => getCompactNumber(value),
        label: "Expenses",
    },
    profit: {
        icon: <TrendingUp size={20} />,
        color: "rgb(251, 146, 60)",
        formatter: (value) => getCompactNumber(value),
        label: "Profit",
    },
    moneyToPay: {
        icon: CreditIcon,
        color: "#ef4444",
        formatter: (value) => getCompactNumber(value),
        label: "Due",
    },
    schoolNet: {
        icon: <TrendingUp size={20} />,
        color: "rgb(251, 146, 60)",
        formatter: (value) => getCompactNumber(value),
        label: "Profit",
    },
    studentPayments: {
        icon: CreditIcon,
        color: studentEntity.color,
        formatter: (value) => getCompactNumber(value),
        label: "Student Payments",
    },
    teacherPayments: {
        icon: CreditIcon,
        color: teacherEntity.color,
        formatter: (value) => getCompactNumber(value),
        label: "Teacher Payments",
    },
    rentals: {
        icon: <HelmetIcon className="w-5 h-5" />,
        color: rentalEntity.color,
        formatter: (value) => value,
        label: "Rentals",
    },
    package: {
        icon: <Bookmark size={20} />,
        color: packageEntity.color,
        formatter: (value) => value,
        label: "Package",
    },
    equipment: {
        icon: <EquipmentIcon className="w-5 h-5" />,
        color: equipmentEntity.color,
        formatter: (value) => value,
        label: "Equipment",
    },
    repairs: {
        icon: RepairIcon,
        color: "#a855f7",
        formatter: (value) => value,
        label: "Repairs",
    },
};

// --- Helpers ---

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * UI Component to render a stat item with icon, label, and value.
 * Used for table and group headers.
 */
export function StatHeaderItemUI({
    statType,
    value,
    hideLabel = false,
    labelOverride,
    variant = "default",
}: {
    statType: StatType;
    value: string | number;
    hideLabel?: boolean;
    labelOverride?: string;
    variant?: "default" | "profit";
}) {
    const config = STAT_CONFIGS[statType];

    if (!config) {
        return null;
    }

    // Handle profit with dynamic icon based on value
    let IconComponent: React.ElementType | null = null;
    if (statType === "profit" && typeof value === "number") {
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        IconComponent = numValue > 0 ? TrendingUp : numValue < 0 ? TrendingDown : TrendingUpDown;
    } else if (!React.isValidElement(config.icon)) {
        IconComponent = config.icon as React.ElementType;
    }

    const renderedIcon = React.isValidElement(config.icon) ? (
        React.cloneElement(config.icon as React.ReactElement, { size: 12 })
    ) : IconComponent ? (
        <IconComponent size={12} className={variant === "profit" ? "text-primary dark:text-primary/80" : "text-muted-foreground"} />
    ) : null;

    // Profit variant styling
    const profitClass = variant === "profit" ? "px-2.5 py-1.5 rounded-full bg-primary/15 dark:bg-primary/20" : "";
    const valueClass = variant === "profit" ? "text-primary dark:text-primary/90" : "text-foreground";

    return (
        <div
            className={`flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity ${profitClass}`}
            title={hideLabel ? labelOverride || config.label : undefined}
        >
            {renderedIcon}
            {!hideLabel && (
                <>
                    <span
                        className={`text-[10px] font-bold ${variant === "profit" ? "text-primary/60 dark:text-primary/50" : "text-muted-foreground"} uppercase tracking-wider`}
                    >
                        {labelOverride || config.label}:
                    </span>
                    <span className={`text-xs font-bold tabular-nums ${valueClass}`}>{value}</span>
                </>
            )}
            {hideLabel && <span className={`text-xs font-bold tabular-nums ${valueClass}`}>{value}</span>}
        </div>
    );
}

/**
 * Core function to generate a standard StatItem.
 * Used by Databoard, Home, and Classboard contexts.
 */
export function getStat(type: StatType, value: number | string, labelOverride?: string): StatItem {
    const config = STAT_CONFIGS[type];
    const label = labelOverride || config.label || capitalize(type);

    // Handle React Elements as icons vs Components
    const IconComponent = config.icon as React.ElementType;
    const renderedIcon = React.isValidElement(config.icon) ? config.icon : <IconComponent />;

    // Special handling for Profit/Revenue dynamic icons
    if (type === "profit" && typeof value === "number") {
        const DynamicIcon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : TrendingUpDown;
        return {
            icon: <DynamicIcon size={20} />,
            value: config.formatter(value),
            label,
            color: config.color,
            rawValue: value,
        };
    }

    if (typeof value === "string") {
        return {
            icon: renderedIcon,
            value: value,
            label,
            color: config.color,
            rawValue: value,
        };
    }

    return {
        icon: renderedIcon,
        value: config.formatter(value as number),
        label,
        color: config.color,
        rawValue: value,
    };
}

// --- Classboard & Home Specific Exports ---

export type DashboardStatKey = "students" | "teachers" | "events" | "completed" | "duration" | "revenue" | "commission" | "profit";

export const STATS_GROUP_TOP: DashboardStatKey[] = ["students", "teachers", "events"];
export const STATS_GROUP_BOTTOM: DashboardStatKey[] = ["duration", "commission", "profit"];
export const STATS_GROUP_REVENUE: DashboardStatKey[] = ["revenue", "commission", "profit"];

export type DisplayableStat = {
    key: DashboardStatKey;
    label: string;
    value: number;
    formatted: string;
    Icon: any; // Keeping 'any' for Component compatibility in existing consumption
    color?: string;
};

/**
 * Returns the specific dictionary structure used by HomeGrouped and ClassboardHeaderStatsGrid
 */
export function getDashboardStatsDisplay(stats: DailyLessonStats): Record<DashboardStatKey, DisplayableStat> {
    const profit = stats.revenue.profit;

    // Helper to map getStat result to DisplayableStat
    const toDisplay = (key: DashboardStatKey, type: StatType, val: number): DisplayableStat => {
        const stat = getStat(type, val);

        // Extract the icon component if possible, or wrap the node
        // The consumers expect an Icon Component usually: <stat.Icon />
        // But getStat returns a ReactNode.
        // We need to bridge this. For the purpose of the existing components which do <stat.Icon size={...} />,
        // we should probably return the Component reference if available in config.

        const config = STAT_CONFIGS[type];
        let IconComp: any = config.icon;

        // Handle dynamic profit icon specifically for this display format
        if (type === "profit") {
            IconComp = val > 0 ? TrendingUp : val < 0 ? TrendingDown : TrendingUpDown;
        } else if (React.isValidElement(config.icon)) {
            // If it's an element (like <TrendingUpDown />), we can't easily turn it back to a component with size props
            // unless we wrapped it. But strictly adhering to the "Component" expectation:
            IconComp = (props: any) => React.cloneElement(config.icon as React.ReactElement, props);
        }

        return {
            key,
            label: stat.label,
            value: val,
            formatted: stat.value.toString(),
            Icon: IconComp,
            color: stat.color,
        };
    };

    return {
        students: toDisplay("students", "students", stats.studentCount),
        teachers: toDisplay("teachers", "teachers", stats.teacherCount),
        events: toDisplay("events", "events", stats.eventCount),
        completed: toDisplay("completed", "completed", stats.eventCount), // Logic might need adjustment if 'completed' means something specific
        duration: toDisplay("duration", "duration", stats.durationCount),
        revenue: toDisplay("revenue", "revenue", stats.revenue.revenue),
        commission: toDisplay("commission", "commission", stats.revenue.commission),
        profit: toDisplay("profit", "profit", profit),
    };
}
