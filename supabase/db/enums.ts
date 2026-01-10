/**
 * Database Enums - Type-safe validation for TEXT columns
 * Use these for validation and type checking in application code
 * Database stores these as TEXT for flexibility
 * Values copied exactly from drizzle/schema.ts
 */

// School statuses
export const SCHOOL_STATUS = {
    ACTIVE: "active",
    PENDING: "pending",
    CLOSED: "closed",
    BETA: "beta",
} as const;
export type SchoolStatus = (typeof SCHOOL_STATUS)[keyof typeof SCHOOL_STATUS];

// Equipment categories
export const EQUIPMENT_CATEGORY = {
    KITE: "kite",
    WING: "wing",
    WINDSURF: "windsurf",
} as const;
export type EquipmentCategory = (typeof EQUIPMENT_CATEGORY)[keyof typeof EQUIPMENT_CATEGORY];

// Student package statuses
export const STUDENT_PACKAGE_STATUS = {
    REQUESTED: "requested",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
} as const;
export type StudentPackageStatus = (typeof STUDENT_PACKAGE_STATUS)[keyof typeof STUDENT_PACKAGE_STATUS];

// Commission types
export const COMMISSION_TYPE = {
    FIXED: "fixed",
    PERCENTAGE: "percentage",
} as const;
export type CommissionType = (typeof COMMISSION_TYPE)[keyof typeof COMMISSION_TYPE];

// Equipment statuses
export const EQUIPMENT_STATUS = {
    RENTAL: "rental",
    PUBLIC: "public",
    SELLING: "selling",
    SOLD: "sold",
    INREPAIR: "inrepair",
    RIP: "rip",
} as const;
export type EquipmentStatus = (typeof EQUIPMENT_STATUS)[keyof typeof EQUIPMENT_STATUS];

// Lesson statuses
export const LESSON_STATUS = {
    ACTIVE: "active",
    REST: "rest",
    COMPLETED: "completed",
    UNCOMPLETED: "uncompleted",
} as const;
export type LessonStatus = (typeof LESSON_STATUS)[keyof typeof LESSON_STATUS];

// Event statuses
export const EVENT_STATUS = {
    PLANNED: "planned",
    TBC: "tbc",
    COMPLETED: "completed",
    UNCOMPLETED: "uncompleted",
} as const;
export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];

// Rental statuses
export const RENTAL_STATUS = {
    PLANNED: "planned",
    COMPLETED: "completed",
    UNCOMPLETED: "uncompleted",
} as const;
export type RentalStatus = (typeof RENTAL_STATUS)[keyof typeof RENTAL_STATUS];

// Package types
export const PACKAGE_TYPE = {
    RENTAL: "rental",
    LESSONS: "lessons",
} as const;
export type PackageType = (typeof PACKAGE_TYPE)[keyof typeof PACKAGE_TYPE];

// Languages
export const LANGUAGES = {
    SPANISH: "Spanish",
    FRENCH: "French",
    ENGLISH: "English",
    GERMAN: "German",
    ITALIAN: "Italian",
} as const;
export type Language = (typeof LANGUAGES)[keyof typeof LANGUAGES];

// Booking statuses
export const BOOKING_STATUS = {
    ACTIVE: "active",
    COMPLETED: "completed",
    UNCOMPLETED: "uncompleted",
} as const;
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

// Currencies
export const CURRENCY = {
    USD: "USD",
    EUR: "EUR",
    CHF: "CHF",
} as const;
export type Currency = (typeof CURRENCY)[keyof typeof CURRENCY];

// Subscription tiers
export const SUBSCRIPTION_TIER = {
    BLUE: "blue",
    SILVER: "silver",
    GOLD: "gold",
} as const;
export type SubscriptionTier = (typeof SUBSCRIPTION_TIER)[keyof typeof SUBSCRIPTION_TIER];

// Subscription statuses
export const SUBSCRIPTION_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    PAST_DUE: "past_due",
    EXPIRED: "expired",
    TRIAL: "trial",
} as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

/**
 * Validation helpers
 */
export function isValidSchoolStatus(value: string): value is SchoolStatus {
    return Object.values(SCHOOL_STATUS).includes(value as SchoolStatus);
}

export function isValidEquipmentCategory(value: string): value is EquipmentCategory {
    return Object.values(EQUIPMENT_CATEGORY).includes(value as EquipmentCategory);
}

export function isValidStudentPackageStatus(value: string): value is StudentPackageStatus {
    return Object.values(STUDENT_PACKAGE_STATUS).includes(value as StudentPackageStatus);
}

export function isValidCommissionType(value: string): value is CommissionType {
    return Object.values(COMMISSION_TYPE).includes(value as CommissionType);
}

export function isValidEquipmentStatus(value: string): value is EquipmentStatus {
    return Object.values(EQUIPMENT_STATUS).includes(value as EquipmentStatus);
}

export function isValidLessonStatus(value: string): value is LessonStatus {
    return Object.values(LESSON_STATUS).includes(value as LessonStatus);
}

export function isValidEventStatus(value: string): value is EventStatus {
    return Object.values(EVENT_STATUS).includes(value as EventStatus);
}

export function isValidRentalStatus(value: string): value is RentalStatus {
    return Object.values(RENTAL_STATUS).includes(value as RentalStatus);
}

export function isValidPackageType(value: string): value is PackageType {
    return Object.values(PACKAGE_TYPE).includes(value as PackageType);
}

export function isValidLanguage(value: string): value is Language {
    return value.length > 3;
}

export function isValidBookingStatus(value: string): value is BookingStatus {
    return Object.values(BOOKING_STATUS).includes(value as BookingStatus);
}

export function isValidCurrency(value: string): value is Currency {
    return Object.values(CURRENCY).includes(value as Currency);
}

export function isValidSubscriptionTier(value: string): value is SubscriptionTier {
    return Object.values(SUBSCRIPTION_TIER).includes(value as SubscriptionTier);
}

export function isValidSubscriptionStatus(value: string): value is SubscriptionStatus {
    return Object.values(SUBSCRIPTION_STATUS).includes(value as SubscriptionStatus);
}
