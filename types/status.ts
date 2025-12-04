import { eventStatusEnum, lessonStatusEnum } from "@/drizzle/schema";

// ============ SHARED COLOR CONSTANTS ============
// Reusable colors across all status types

export const STATUS_GREY = "#9ca3af";
export const STATUS_PURPLE = "#a855f7";
export const STATUS_GREEN = "#86efac";
export const STATUS_ORANGE = "#fbbf24";

// ============ EVENT STATUS CONFIGURATION ============
export type EventStatus = (typeof eventStatusEnum.enumValues)[number];

export interface EventStatusConfig {
    status: EventStatus;
    color: string;
    label: string;
}

export const EVENT_STATUS_CONFIG: Record<EventStatus, EventStatusConfig> = {
    planned: {
        status: "planned",
        color: STATUS_GREY,
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
export type LessonStatus = (typeof lessonStatusEnum.enumValues)[number];

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

// ============ PROGRESS BAR HELPER ============

/**
 * Get progress bar color based on event statuses
 * Priority: completed > tbc > uncompleted > planned
 */
export function getProgressBarColor(events: Array<{ status: EventStatus }>): string {
    if (events.length === 0) return STATUS_GREY;

    const statusPriority = { completed: 4, tbc: 3, uncompleted: 2, planned: 1 };
    const dominantStatus = events.reduce((max, evt) => {
        const maxPriority = statusPriority[max.status as keyof typeof statusPriority] || 0;
        const evtPriority = statusPriority[evt.status as keyof typeof statusPriority] || 0;
        return evtPriority > maxPriority ? evt : max;
    }).status;

    return EVENT_STATUS_CONFIG[dominantStatus].color;
}
