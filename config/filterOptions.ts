// Status filter options used across StudentTable and TeacherTable
export const STATUS_FILTER_OPTIONS = ["All", "New", "Ongoing"] as const;
export type StatusFilterType = typeof STATUS_FILTER_OPTIONS[number];

// Package access filter options
export const ACCESS_FILTER_OPTIONS = ["All", "Public", "Private"] as const;
export type AccessFilterType = typeof ACCESS_FILTER_OPTIONS[number];

// Package capacity filter options
export const CAPACITY_FILTER_OPTIONS = ["All", "Single", "Double", "More"] as const;
export type CapacityFilterType = typeof CAPACITY_FILTER_OPTIONS[number];
