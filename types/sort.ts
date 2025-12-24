export type SortDirection = "asc" | "desc";

export interface SortOption {
    label: string;
    field: string;
    direction: SortDirection;
    isCustom?: boolean; // For fields like bookingCount that aren't direct schema properties
}

export type SortConfig = {
    field: string | null;
    direction: SortDirection;
};

export const SORT_OPTIONS_DEFAULT: SortOption[] = [
    { label: "Newest", field: "createdAt", direction: "desc" },
    { label: "Oldest", field: "createdAt", direction: "asc" },
    { label: "Recently Updated", field: "updatedAt", direction: "desc" },
    { label: "Oldest Updated", field: "updatedAt", direction: "asc" },
];

export const ENTITY_SORT_OPTIONS: Record<string, SortOption[]> = {
    student: [
        ...SORT_OPTIONS_DEFAULT,
        { label: "Most Bookings", field: "bookingCount", direction: "desc", isCustom: true },
        { label: "Least Bookings", field: "bookingCount", direction: "asc", isCustom: true },
    ],
    teacher: [
        ...SORT_OPTIONS_DEFAULT,
        { label: "Most Lessons", field: "lessonCount", direction: "desc", isCustom: true },
        { label: "Least Lessons", field: "lessonCount", direction: "asc", isCustom: true },
    ],
    schoolPackage: [
        ...SORT_OPTIONS_DEFAULT,
        { label: "Most Popular", field: "studentPackageCount", direction: "desc", isCustom: true },
        { label: "Least Popular", field: "studentPackageCount", direction: "asc", isCustom: true },
    ],
    equipment: [
        ...SORT_OPTIONS_DEFAULT,
        { label: "Most Used (Time)", field: "eventDuration", direction: "desc", isCustom: true },
        { label: "Least Used (Time)", field: "eventDuration", direction: "asc", isCustom: true },
    ],
    booking: SORT_OPTIONS_DEFAULT,
    event: SORT_OPTIONS_DEFAULT,
};
