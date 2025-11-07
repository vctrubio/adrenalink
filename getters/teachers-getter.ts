import type { TeacherModel } from "@/backend/models";

export function getTeacherLessonsCount(teacher: TeacherModel): number {
    return teacher.relations?.lessons?.length || 0;
}

export function getTeacherEventsCount(teacher: TeacherModel): number {
    const lessons = teacher.relations?.lessons || [];
    let totalEvents = 0;

    for (const lesson of lessons) {
        totalEvents += lesson.events?.length || 0;
    }

    return totalEvents;
}

export function getTeacherTotalHours(teacher: TeacherModel): number {
    const lessons = teacher.relations?.lessons || [];
    let totalMinutes = 0;

    for (const lesson of lessons) {
        if (lesson.events) {
            for (const event of lesson.events) {
                totalMinutes += event.duration || 0;
            }
        }
    }

    return Math.round(totalMinutes / 60);
}

export function getTeacherMoneyEarned(teacher: TeacherModel): number {
    const lessons = teacher.relations?.lessons || [];
    let totalEarnings = 0;

    for (const lesson of lessons) {
        const commission = lesson.commission;
        if (!commission) continue;

        const cph = parseFloat(commission.cph.toString());
        const events = lesson.events || [];

        for (const event of events) {
            const hours = event.duration / 60;
            totalEarnings += hours * cph;
        }
    }

    return Math.round(totalEarnings);
}

export function getTeacherUnfinishedEvents(teacher: TeacherModel): Array<{ id: string; equipmentCategory: string | null }> {
    const lessons = teacher.relations?.lessons || [];
    const unfinishedEvents = [];

    for (const lesson of lessons) {
        const events = lesson.events || [];

        for (const event of events) {
            if (event.status === "tbc") {
                const equipmentEvents = event.equipmentEvents || [];
                const category = equipmentEvents[0]?.equipment?.category || null;

                unfinishedEvents.push({
                    id: event.id,
                    equipmentCategory: category,
                });
            }
        }
    }

    return unfinishedEvents;
}

export function isTeacherLessonReady(teacher: TeacherModel): boolean {
    const lessons = teacher.relations?.lessons || [];

    for (const lesson of lessons) {
        const events = lesson.events || [];
        const hasPlannedEvent = events.some(event => event.status === "planned");

        if (hasPlannedEvent) {
            return false;
        }

        if (lesson.status === "active") {
            const booking = lesson.booking;
            if (booking && booking.status === "active") {
                return true;
            }
        }
    }

    return false;
}
