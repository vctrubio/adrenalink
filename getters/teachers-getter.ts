import type { TeacherModel } from "@/backend/models";

// ============ TEACHER HELPER FUNCTIONS ============
// DEPRECATED: For new databoard stats, use TeacherDataboard in /getters/databoard-getter.ts
// These functions are only for non-databoard contexts (popovers, etc.)

export function getTeacherUnfinishedEvents(teacher: TeacherModel): { id: string; equipmentCategory: string | null }[] {
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
