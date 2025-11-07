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
