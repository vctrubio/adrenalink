import type { DataboardFilterByDate, DataboardGroupByDate } from "@/types/databoard";

export const DATABOARD_DATE_FILTERS: DataboardFilterByDate[] = ["All", "Last 72 days", "Last 30 days"];

export const DATABOARD_DATE_GROUPS: DataboardGroupByDate[] = ["All", "Daily", "Weekly", "Monthly"];

export const DATABOARD_ENTITY_SEARCH_FIELDS: Record<string, string[]> = {
    student: ["firstName", "lastName", "phone", "passport"],
    teacher: ["username", "passport", "phone"],
    booking: [
        "leaderStudentName",
        "bookingStudentFirstNames",
        "bookingStudentLastNames",
        "bookingStudentPassports",
        "bookingStudentPhones",
    ],
    equipment: ["sku", "model", "color", "category"],
    event: ["location"],
    rental: ["location"],
    referral: ["code", "description"],
    studentPackage: [],
    schoolPackage: ["description"],
};

export const DATABOARD_ENTITY_GROUP_FIELDS: Record<string, (string | { field: string; label: string })[]> = {
    event: ["status", "location", "date"],
    equipment: ["category", "status", "date"],
    booking: ["status", "date"],
    rental: ["status", "location", "date"],
    student: ["date"],
    teacher: ["date"],
    referral: ["commissionType", "date"],
    studentPackage: ["status", "date"],
    schoolPackage: ["date"],
};

export const DATABOARD_ENTITY_FILTER_OPTIONS: Record<string, Record<string, string[]>> = {
    event: {
        status: ["planned", "tbc", "completed", "uncompleted"],
        location: [],
    },
    equipment: {
        category: ["kite", "wing", "windsurf"],
        status: ["rental", "public", "selling", "sold", "inrepair", "rip"],
    },
    booking: {
        status: ["active", "completed", "uncompleted"],
    },
    rental: {
        status: ["planned", "completed", "cancelled"],
    },
    studentPackage: {
        status: ["requested", "accepted", "rejected"],
    },
    schoolPackage: {
        packageType: ["rental", "lessons"],
    },
};
