import type { TeacherTableData, TeacherTableStats } from "@/config/tables";

/**
 * Aggregates statistics for a list of teachers
 */
export function getAggregateTeachers(teachers: TeacherTableData[]): TeacherTableStats {
    return teachers.reduce(
        (acc, curr) => ({
            teacherCount: acc.teacherCount + 1,
            totalLessons: acc.totalLessons + curr.stats.totalLessons,
            totalDurationMinutes: acc.totalDurationMinutes + curr.stats.totalDurationMinutes,
            totalCommissions: acc.totalCommissions + curr.stats.totalCommissions,
            totalPayments: acc.totalPayments + curr.stats.totalPayments,
        }),
        {
            teacherCount: 0,
            totalLessons: 0,
            totalDurationMinutes: 0,
            totalCommissions: 0,
            totalPayments: 0,
        }
    );
}
