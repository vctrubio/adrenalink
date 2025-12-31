/**
 * ClassboardStatistics - Computes statistics from TeacherQueues
 *
 * Stats computed:
 * - students: unique students with events
 * - teachers: teachers with events
 * - duration: total event duration in minutes
 * - commissions: total teacher commissions
 * - revenue: total school revenue
 */

import type { TeacherQueue } from "./TeacherQueue";

export interface RevenueStats {
    commission: number;
    revenue: number;
    profit: number;
}

export interface DailyLessonStats {
    teacherCount: number;
    studentCount: number;
    eventCount: number;
    durationCount: number;  // in minutes
    revenue: RevenueStats;
}

export class ClassboardStatistics {
    private teacherQueues: TeacherQueue[];

    constructor(teacherQueues: TeacherQueue[]) {
        this.teacherQueues = teacherQueues;
    }

    /**
     * Get daily lesson statistics from active teacher queues
     */
    getDailyLessonStats(): DailyLessonStats {
        const activeTeacherStats = this.teacherQueues
            .map(queue => queue.getStats())
            .filter(stats => stats.eventCount > 0);
        
        const teacherCount = activeTeacherStats.length;
        const studentCount = activeTeacherStats.reduce((sum, stats) => sum + stats.studentCount, 0);
        const eventCount = activeTeacherStats.reduce((sum, stats) => sum + stats.eventCount, 0);
        const durationCount = activeTeacherStats.reduce((sum, stats) => sum + stats.totalHours, 0) * 60; // Convert hours to minutes
        const totalRevenue = activeTeacherStats.reduce((sum, stats) => sum + stats.totalRevenue.revenue, 0);
        const totalCommission = activeTeacherStats.reduce((sum, stats) => sum + stats.totalRevenue.commission, 0);
        const totalProfit = activeTeacherStats.reduce((sum, stats) => sum + stats.totalRevenue.profit, 0);

        return {
            teacherCount,
            studentCount,
            eventCount,
            durationCount: Math.round(durationCount * 10) / 10, // Round to 1 decimal
            revenue: {
                commission: Math.round(totalCommission * 100) / 100,
                revenue: Math.round(totalRevenue * 100) / 100,
                profit: Math.round(totalProfit * 100) / 100,
            },
        };
    }
}
