import type { DataboardFilterByDate, DataboardGroupByDate } from "@/types/databoard";

export const DATABOARD_DATE_FILTERS: DataboardFilterByDate[] = ["All", "Last 7 days", "Last 30 days"];

export const DATABOARD_DATE_GROUPS: DataboardGroupByDate[] = ["All", "Daily", "Weekly", "Monthly"];

export const DATABOARD_ENTITY_SEARCH_FIELDS: Record<string, string[]> = {
    student: ["firstName", "lastName", "phone", "passport"],
    teacher: ["username", "passport", "phone"],
    booking: ["id", "status"],
    equipment: ["sku", "model", "color", "category", "status"],
};
