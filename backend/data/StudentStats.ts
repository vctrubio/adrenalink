import type { StudentTableData, StudentTableStats } from "@/config/tables";

export interface AggregateStudentStats extends StudentTableStats {
    studentCount: number;
}

/**
 * Aggregates statistics for a list of students
 */
export function getAggregateStudents(students: StudentTableData[]): AggregateStudentStats {
    return students.reduce(
        (acc, curr) => ({
            studentCount: acc.studentCount + 1,
            totalBookings: acc.totalBookings + curr.stats.totalBookings,
            totalEvents: acc.totalEvents + curr.stats.totalEvents,
            totalDurationMinutes: acc.totalDurationMinutes + curr.stats.totalDurationMinutes,
            totalRevenue: acc.totalRevenue + curr.stats.totalRevenue,
            totalPayments: acc.totalPayments + curr.stats.totalPayments,
        }),
        {
            studentCount: 0,
            totalBookings: 0,
            totalEvents: 0,
            totalDurationMinutes: 0,
            totalRevenue: 0,
            totalPayments: 0,
        }
    );
}
