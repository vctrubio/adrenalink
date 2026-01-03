import { EVENT_STATUS_CONFIG } from "@/types/status";
import type { ClassboardLesson } from "@/backend/models/ClassboardModel";

const EMPTY_COLOR = "rgba(107, 114, 128, 0.3)";

interface BookingProgressResult {
    background: string;
    completedEnd: number;
    uncompletedEnd: number;
    plannedEnd: number;
    tbcEnd: number;
}

export function getBookingProgressBar(lessons: ClassboardLesson[], totalMinutes: number): BookingProgressResult {
    const allEvents = lessons.flatMap((lesson) => lesson.events);

    const eventMinutes = {
        completed: allEvents.filter((e) => e.status === "completed").reduce((sum, e) => sum + e.duration, 0),
        uncompleted: allEvents.filter((e) => e.status === "uncompleted").reduce((sum, e) => sum + e.duration, 0),
        planned: allEvents.filter((e) => e.status === "planned").reduce((sum, e) => sum + e.duration, 0),
        tbc: allEvents.filter((e) => e.status === "tbc").reduce((sum, e) => sum + e.duration, 0),
    };

    const totalUsedMinutes = eventMinutes.completed + eventMinutes.uncompleted + eventMinutes.planned + eventMinutes.tbc;
    const denominator = totalUsedMinutes > totalMinutes ? totalUsedMinutes : totalMinutes;

    const completedEnd = denominator > 0 ? (eventMinutes.completed / denominator) * 100 : 0;
    const uncompletedEnd = completedEnd + (denominator > 0 ? (eventMinutes.uncompleted / denominator) * 100 : 0);
    const plannedEnd = uncompletedEnd + (denominator > 0 ? (eventMinutes.planned / denominator) * 100 : 0);
    const tbcEnd = plannedEnd + (denominator > 0 ? (eventMinutes.tbc / denominator) * 100 : 0);

    return {
        background: `linear-gradient(to right, ${EVENT_STATUS_CONFIG.completed.color} ${completedEnd}%, ${EVENT_STATUS_CONFIG.uncompleted.color} ${completedEnd}% ${uncompletedEnd}%, ${EVENT_STATUS_CONFIG.planned.color} ${uncompletedEnd}% ${plannedEnd}%, ${EVENT_STATUS_CONFIG.tbc.color} ${plannedEnd}% ${tbcEnd}%, ${EMPTY_COLOR} ${tbcEnd}%)`,
        completedEnd,
        uncompletedEnd,
        plannedEnd,
        tbcEnd,
    };
}
