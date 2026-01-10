import type { TeacherWithLessonsAndPayments, TeacherTableStats } from "@/config/tables";

/**
 * Calculate stats for a single teacher record
 */
export function calculateTeacherStats(teacher: TeacherWithLessonsAndPayments): TeacherTableStats {
    const totalLessons = teacher.lessons.length;
    const totalDurationMinutes = teacher.lessons.reduce((sum, l) => sum + l.events.totalDuration, 0);
    const totalCommissions = teacher.lessons.reduce((sum, l) => {
        const { commission, events, lessonRevenue } = l;
        const duration = events.totalDuration / 60;
        const cph = parseFloat(commission.cph || "0");

        if (commission.type === "fixed") {
            return sum + cph * duration;
        } else if (commission.type === "percentage") {
            return sum + lessonRevenue * (cph / 100);
        }
        return sum;
    }, 0);
    const totalPayments = teacher.lessons.reduce((sum, l) => sum + l.teacherPayments, 0);

    return {
        teacherCount: 1,
        totalLessons,
        totalDurationMinutes,
        totalCommissions,
        totalPayments,
    };
}
