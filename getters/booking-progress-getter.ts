import { EVENT_STATUS_CONFIG } from "@/types/status";
import type { ClassboardEvent } from "@/backend/models/ClassboardModel";

const EMPTY_COLOR = "rgba(107, 114, 128, 0.3)";

const STATUS_PRIORITY: Record<string, number> = {
    planned: 0,
    uncompleted: 1,
    tbc: 2,
    completed: 3,
};

export interface EventStatusMinutes {
    completed: number;
    uncompleted: number;
    planned: number;
    tbc: number;
}

export function sortEventsByStatus<T extends ClassboardEvent>(events: T[]): T[] {
    return [...events].sort((a, b) => {
        const priorityA = STATUS_PRIORITY[a.status] ?? 999;
        const priorityB = STATUS_PRIORITY[b.status] ?? 999;
        if (priorityA !== priorityB) return priorityA - priorityB;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
}

export function getEventStatusCounts(events: ClassboardEvent[]): EventStatusMinutes {
    return {
        completed: events.filter((e) => e.status === "completed").reduce((sum, e) => sum + (e.duration || 0), 0),
        uncompleted: events.filter((e) => e.status === "uncompleted").reduce((sum, e) => sum + (e.duration || 0), 0),
        planned: events.filter((e) => e.status === "planned").reduce((sum, e) => sum + (e.duration || 0), 0),
        tbc: events.filter((e) => e.status === "tbc").reduce((sum, e) => sum + (e.duration || 0), 0),
    };
}

export function getProgressColor(counts: EventStatusMinutes, totalMinutes: number): string {
    const totalUsedMinutes = counts.completed + counts.uncompleted + counts.planned + counts.tbc;
    const denominator = totalUsedMinutes > totalMinutes ? totalUsedMinutes : totalMinutes;

    if (denominator === 0) return `${EMPTY_COLOR}`;

    const completedEnd = (counts.completed / denominator) * 100;
    const uncompletedEnd = completedEnd + (counts.uncompleted / denominator) * 100;
    const plannedEnd = uncompletedEnd + (counts.planned / denominator) * 100;
    const tbcEnd = plannedEnd + (counts.tbc / denominator) * 100;

    return `linear-gradient(to right, ${EVENT_STATUS_CONFIG.completed.color} ${completedEnd}%, ${EVENT_STATUS_CONFIG.uncompleted.color} ${completedEnd}% ${uncompletedEnd}%, ${EVENT_STATUS_CONFIG.planned.color} ${uncompletedEnd}% ${plannedEnd}%, ${EVENT_STATUS_CONFIG.tbc.color} ${plannedEnd}% ${tbcEnd}%, ${EMPTY_COLOR} ${tbcEnd}%)`;
}
