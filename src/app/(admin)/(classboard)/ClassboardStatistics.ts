/**
 * ClassboardStatistics - Computes statistics from TeacherQueues for a specific date
 *
 * Stats computed:
 * - students: unique students with events on the date
 * - teachers: teachers with events on the date
 * - lessons: total lesson count (from teacher queues)
 * - duration: total event duration in minutes for the date
 * - commissions: total teacher commissions for the date
 * - revenue: total school revenue for the date
 */

import type { TeacherQueue } from "./TeacherQueue";

export interface TeacherStats {
    teacherUsername: string;
    lessonCount: number;
    eventCount: number;
    studentCount: number;
    totalHours: number;
    earnings: {
        teacher: number;
        school: number;
        total: number;
    };
}

export interface ClassboardHeaderStats {
    students: number;
    teachers: number;
    lessons: number;
    duration: number;       // in minutes
    commissions: number;    // currency amount
    revenue: number;        // currency amount
}

export interface GlobalStats {
    teacherCount: number;
    totalLessons: number;
    totalEvents: number;
    totalStudents: number;
    totalHours: number;
    totalRevenue: {
        teacher: number;
        school: number;
        profit: number;
    };
    isComplete: boolean;
    completionPercentage: number;
}

export class ClassboardStatistics {
    private teacherQueues: TeacherQueue[];
    private selectedDate: string;
    private teacherStats: TeacherStats[];

    constructor(teacherQueues: TeacherQueue[], selectedDate: string) {
        this.teacherQueues = teacherQueues;
        this.selectedDate = selectedDate;
        this.teacherStats = this.computeTeacherStats();
    }

    private computeTeacherStats(): TeacherStats[] {
        return this.teacherQueues.map(queue => queue.getStats());
    }

    /**
     * Get all stats for the header display
     */
    getHeaderStats(): ClassboardHeaderStats {
        const totalStudents = this.teacherStats.reduce((sum, stats) => sum + stats.studentCount, 0);
        const totalTeachers = this.teacherStats.length;
        const totalLessons = this.teacherStats.reduce((sum, stats) => sum + stats.lessonCount, 0);
        const totalDuration = this.teacherStats.reduce((sum, stats) => sum + stats.totalDuration, 0);
        const totalCommissions = this.teacherStats.reduce((sum, stats) => sum + stats.earnings.teacher, 0);
        const totalRevenue = this.teacherStats.reduce((sum, stats) => sum + stats.earnings.school, 0);
        return {
            students: totalStudents,
            teachers: totalTeachers,
            lessons: totalLessons,
            duration: totalDuration,
            commissions: Math.round(totalCommissions * 100) / 100,
            revenue: Math.round(totalRevenue * 100) / 100,
        };
    }

    getGlobalStats(): GlobalStats {
        const teacherCount = this.teacherStats.length;
        const totalLessons = this.teacherStats.reduce((sum, stats) => sum + stats.lessonCount, 0);
        const totalEvents = this.teacherStats.reduce((sum, stats) => sum + stats.eventCount, 0);
        const totalHours = this.teacherStats.reduce((sum, stats) => sum + stats.totalHours, 0);
        const totalStudents = this.teacherStats.reduce((sum, stats) => sum + stats.studentCount, 0);

        const totalRevenue = this.teacherStats.reduce(
            (acc, stats) => ({
                teacher: acc.teacher + stats.earnings.teacher,
                school: acc.school + stats.earnings.school,
                profit: acc.profit + stats.earnings.total,
            }),
            { teacher: 0, school: 0, profit: 0 }
        );

        const isComplete = totalLessons > 0 && totalEvents === totalLessons;
        const completionPercentage = totalLessons > 0
            ? Math.round((totalEvents / totalLessons) * 100)
            : 0;

        return {
            teacherCount,
            totalLessons,
            totalEvents,
            totalStudents,
            totalHours: Math.round(totalHours * 10) / 10,
            totalRevenue: {
                teacher: Math.round(totalRevenue.teacher * 100) / 100,
                school: Math.round(totalRevenue.school * 100) / 100,
                profit: Math.round(totalRevenue.profit * 100) / 100,
            },
            isComplete,
            completionPercentage,
        };
    }

    getTeacherStats(teacherUsername: string): TeacherStats | null {
        return this.teacherStats.find(stats => stats.teacherUsername === teacherUsername) || null;
    }

    getAllTeacherStats(): TeacherStats[] {
        return this.teacherStats;
    }

    isTeacherComplete(teacherUsername: string): boolean {
        const stats = this.getTeacherStats(teacherUsername);
        if (!stats) return false;
        return stats.lessonCount > 0 && stats.eventCount === stats.lessonCount;
    }

    getTeacherCompletionPercentage(teacherUsername: string): number {
        const stats = this.getTeacherStats(teacherUsername);
        if (!stats || stats.lessonCount === 0) return 0;
        return Math.round((stats.eventCount / stats.lessonCount) * 100);
    }
}
