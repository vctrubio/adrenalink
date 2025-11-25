import { STATUS_COLORS } from "@/types/status";
import type { ClassboardLesson } from "@/backend/models/ClassboardModel";

const EMPTY_COLOR = "#374151";

interface BookingProgressResult {
    background: string;
    completedEnd: number;
    plannedEnd: number;
    tbcEnd: number;
}

export function getBookingProgressBar(lessons: ClassboardLesson[], totalMinutes: number): BookingProgressResult {
    const allEvents = lessons.flatMap((lesson) => lesson.events);

    const eventMinutes = {
        completed: allEvents.filter((e) => e.status === "completed").reduce((sum, e) => sum + e.duration, 0),
        planned: allEvents.filter((e) => e.status === "planned").reduce((sum, e) => sum + e.duration, 0),
        tbc: allEvents.filter((e) => e.status === "tbc").reduce((sum, e) => sum + e.duration, 0),
    };

    const totalUsedMinutes = eventMinutes.completed + eventMinutes.planned + eventMinutes.tbc;
    const denominator = totalUsedMinutes > totalMinutes ? totalUsedMinutes : totalMinutes;

    const completedEnd = denominator > 0 ? (eventMinutes.completed / denominator) * 100 : 0;
    const plannedEnd = completedEnd + (denominator > 0 ? (eventMinutes.planned / denominator) * 100 : 0);
    const tbcEnd = plannedEnd + (denominator > 0 ? (eventMinutes.tbc / denominator) * 100 : 0);

    return {
        background: `linear-gradient(to right, ${STATUS_COLORS.eventCompleted} ${completedEnd}%, ${STATUS_COLORS.eventPlanned} ${completedEnd}% ${plannedEnd}%, ${STATUS_COLORS.eventTbc} ${plannedEnd}% ${tbcEnd}%, ${EMPTY_COLOR} ${tbcEnd}%)`,
        completedEnd,
        plannedEnd,
        tbcEnd,
    };
}
