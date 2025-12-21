import type { TeacherModel } from "@/backend/models";

// ============ TEACHER STATS NAMESPACE ============
// Reads from pre-calculated stats in databoard models
// Falls back to relation traversal for non-databoard usage

export const TeacherStats = {
    getMoneyIn: (teacher: TeacherModel): number => teacher.stats?.money_in || 0,
    getMoneyOut: (teacher: TeacherModel): number => teacher.stats?.money_out || 0,
    getEventsCount: (teacher: TeacherModel): number => teacher.stats?.events_count || 0,
    getTotalHours: (teacher: TeacherModel): number => (teacher.stats?.total_duration_minutes || 0) / 60,
    getLessonsCount: (teacher: TeacherModel): number => teacher.stats?.lessons_count || 0,
    getMoneyEarned: (teacher: TeacherModel): number => TeacherStats.getMoneyIn(teacher) - TeacherStats.getMoneyOut(teacher),
    getTotalCommissions: (teacher: TeacherModel): number => TeacherStats.getMoneyOut(teacher), // money_out = teacher commissions
    getTotalRevenue: (teacher: TeacherModel): number => TeacherStats.getMoneyIn(teacher), // money_in = student revenue
};

// ============ LEGACY RELATION-BASED GETTERS ============
// Used for non-databoard contexts where stats aren't available

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
