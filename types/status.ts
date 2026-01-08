import { EVENT_STATUS, LESSON_STATUS, BOOKING_STATUS } from "@/supabase/db/enums";

// ============ SHARED COLOR CONSTANTS ============
// Reusable colors across all status types

export const STATUS_GREY = "rgba(107, 114, 128, 0.3)"; // Subtle, works in dark mode
export const STATUS_DARK = "#6b7280"; // For inactive/sold statuses
export const STATUS_PURPLE = "#a855f7"; // Equipment color
export const STATUS_GREEN = "#22c55e"; // Teacher color
export const STATUS_ORANGE = "#fbbf24";
export const ACTION_CYAN = "#06b6d4";

// ============ BADGE COLOR AND OPACITY CONSTANTS ============
// Darker colors for better badge contrast, with defined opacity levels

export const BADGE_STATUS_GREEN = "#22c55e"; // Darker green for better contrast
export const BADGE_ACTION_CYAN = "#06b6d4";
export const BADGE_STATUS_ORANGE = "#f59e0b";

export const BADGE_BG_OPACITY_DARK = "50"; // For primary status badges
export const BADGE_BG_OPACITY_MEDIUM = "30"; // For secondary badges
export const BADGE_BG_OPACITY_LIGHT = "20"; // For light badges

// ============ EVENT STATUS CONFIGURATION ============
export type EventStatus = typeof EVENT_STATUS[keyof typeof EVENT_STATUS];

export interface EventStatusConfig {
    status: EventStatus;
    color: string;
    label: string;
}

export const EVENT_STATUS_CONFIG: Record<EventStatus, EventStatusConfig> = {
    planned: {
        status: "planned",
        color: STATUS_DARK,
        label: "Planned",
    },
    tbc: {
        status: "tbc",
        color: STATUS_PURPLE,
        label: "To Be Confirmed",
    },
    completed: {
        status: "completed",
        color: STATUS_GREEN,
        label: "Completed",
    },
    uncompleted: {
        status: "uncompleted",
        color: STATUS_ORANGE,
        label: "Uncompleted",
    },
} as const;

// ============ LESSON STATUS CONFIGURATION ============
export type LessonStatus = typeof LESSON_STATUS[keyof typeof LESSON_STATUS];

export interface LessonStatusConfig {
    status: LessonStatus;
    color: string;
    label: string;
}

export const LESSON_STATUS_CONFIG: Record<LessonStatus, LessonStatusConfig> = {
    active: {
        status: "active",
        color: STATUS_GREY,
        label: "Active",
    },
    rest: {
        status: "rest",
        color: STATUS_PURPLE,
        label: "Rest",
    },
    completed: {
        status: "completed",
        color: STATUS_GREEN,
        label: "Completed",
    },
    uncompleted: {
        status: "uncompleted",
        color: STATUS_ORANGE,
        label: "Uncompleted",
    },
} as const;

// ============ ACTION BUTTON CONFIGURATION ============
export type ActionType = "cancel" | "reset" | "submit";

export interface ActionButtonConfig {
    label: string;
    className: string;
}

export const ACTION_BUTTON_CONFIG: Record<ActionType, ActionButtonConfig> = {
    cancel: {
        label: "Cancel",
        className: "bg-muted text-foreground rounded hover:bg-muted/80 transition-colors",
    },
    reset: {
        label: "Reset",
        className: "bg-background border border-border text-foreground rounded hover:bg-muted transition-colors",
    },
    submit: {
        label: "Submit",
        className: "bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors",
    },
} as const;

// ============ BOOKING STATUS CONFIGURATION ============
export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export interface BookingStatusConfig {
    status: BookingStatus;
    color: string;
    label: string;
}

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, BookingStatusConfig> = {
    active: {
        status: "active",
        color: STATUS_GREY,
        label: "Active",
    },
    completed: {
        status: "completed",
        color: STATUS_GREEN,
        label: "Completed",
    },
    uncompleted: {
        status: "uncompleted",
        color: STATUS_ORANGE,
        label: "Uncompleted",
    },
} as const;

// ============ SCHOOL STUDENT STATUS CONFIGURATION ============
export type SchoolStudentStatus = "active" | "inactive";

export interface SchoolStudentStatusConfig {
    status: SchoolStudentStatus;
    color: string;
    label: string;
}

export const SCHOOL_STUDENT_STATUS_CONFIG: Record<SchoolStudentStatus, SchoolStudentStatusConfig> = {
    active: {
        status: "active",
        color: STATUS_GREY,
        label: "Active",
    },
    inactive: {
        status: "inactive",
        color: STATUS_DARK,
        label: "Inactive",
    },
} as const;

// ============ TEACHER STATUS CONFIGURATION ============
export type TeacherStatus = "active" | "inactive";

export interface TeacherStatusConfig {
    status: TeacherStatus;
    color: string;
    label: string;
}

export const TEACHER_STATUS_CONFIG: Record<TeacherStatus, TeacherStatusConfig> = {
    active: {
        status: "active",
        color: STATUS_GREY,
        label: "Active",
    },
    inactive: {
        status: "inactive",
        color: STATUS_DARK,
        label: "Inactive",
    },
} as const;

// ============ SCHOOL PACKAGE STATUS CONFIGURATION ============
export type SchoolPackageStatus = "active" | "inactive";

export interface SchoolPackageStatusConfig {
    status: SchoolPackageStatus;
    color: string;
    label: string;
}

export const SCHOOL_PACKAGE_STATUS_CONFIG: Record<SchoolPackageStatus, SchoolPackageStatusConfig> = {
    active: {
        status: "active",
        color: STATUS_GREY,
        label: "Active",
    },
    inactive: {
        status: "inactive",
        color: STATUS_DARK,
        label: "Inactive",
    },
} as const;

// ============ EQUIPMENT STATUS CONFIGURATION ============
export type EquipmentStatus = "rental" | "public" | "selling" | "sold" | "inrepair" | "rip";

export interface EquipmentStatusConfig {
    status: EquipmentStatus;
    color: string;
    label: string;
}

export const EQUIPMENT_STATUS_CONFIG: Record<EquipmentStatus, EquipmentStatusConfig> = {
    rental: {
        status: "rental",
        color: "#ef4444",
        label: "Rental",
    },
    public: {
        status: "public",
        color: STATUS_GREEN,
        label: "Public",
    },
    selling: {
        status: "selling",
        color: STATUS_ORANGE,
        label: "Selling",
    },
    sold: {
        status: "sold",
        color: STATUS_DARK,
        label: "Sold",
    },
    inrepair: {
        status: "inrepair",
        color: "#ef4444",
        label: "In Repair",
    },
    rip: {
        status: "rip",
        color: "#6b7280",
        label: "RIP",
    },
} as const;
