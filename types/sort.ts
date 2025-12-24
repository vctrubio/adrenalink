export type SortDirection = "asc" | "desc";

export interface SortOption {
    label: string;
    value: string; // The field name (e.g., 'createdAt')
}

export type SortConfig = {
    field: string | null;
    direction: SortDirection;
};

export const SORT_OPTIONS_DEFAULT: SortOption[] = [
    { label: "Created", value: "createdAt" },
    { label: "Updated", value: "updatedAt" },
];
