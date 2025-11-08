// Status Enums - Maps to drizzle/schema.ts enums
// onStatusChange will handle API calls with revalidatePath
// Each entity can only change to its own enum values

export type StudentStatus = "active" | "inactive";

export type TeacherStatus = "active" | "inactive";

export type BookingStatus = "active" | "completed" | "uncompleted";

export type EquipmentStatus = "rental" | "public" | "selling" | "sold" | "inrepair" | "rip";

export type StudentPackageStatus = "requested" | "accepted" | "rejected";

export type SchoolPackageStatus = "active" | "inactive";

export type ReferralStatus = "active" | "inactive";

export type RentalStatus = "planned" | "completed" | "cancelled";

// Union type for all status types
export type StatusType = StudentStatus | TeacherStatus | BookingStatus | EquipmentStatus | StudentPackageStatus | SchoolPackageStatus | ReferralStatus | RentalStatus;

// Entity status type mapping
export const statusOptionsMap = {
    student: ["active", "inactive"] as const,
    teacher: ["active", "inactive"] as const,
    booking: ["active", "completed", "uncompleted"] as const,
    equipment: ["rental", "public", "selling", "sold", "inrepair", "rip"] as const,
    studentPackage: ["requested", "accepted", "rejected"] as const,
    schoolPackage: ["active", "inactive"] as const,
    referral: ["active", "inactive"] as const,
    rental: ["planned", "completed", "cancelled"] as const,
} as const;

// Status color mapping - determines which color (default/blue/gold) to display
export type StatusColorType = "default" | "blue" | "gold";

export const statusColorMap: Record<StatusType, StatusColorType> = {
    // Student Status
    active: "default",
    inactive: "default",

    // Teacher Status - same as student

    // Booking Status
    completed: "gold",
    uncompleted: "default",

    // Equipment Status
    rental: "default",
    public: "default",
    selling: "blue",
    sold: "gold",
    inrepair: "default",
    rip: "default",

    // Student Package Status
    requested: "blue",
    accepted: "gold",
    rejected: "default",

    // School Package Status - same as student/teacher

    // Referral Status - same as student/teacher

    // Rental Status
    planned: "default",
    cancelled: "default",
} as const;

// Helper function to get status options for an entity
export function getStatusOptions(entity: string): string[] {
    const options = statusOptionsMap[entity as keyof typeof statusOptionsMap];
    return options ? Array.from(options) : [];
}

// Helper function to get status color
export function getStatusColor(status: string): StatusColorType {
    return statusColorMap[status as StatusType] || "default";
}
