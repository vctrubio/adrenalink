/**
 * ClassboardStats - Aggregates statistics from teacher queues for a single school
 * Focuses on lesson count vs event count to determine day completion
 *
 * Mastermind Logic:
 * - lessonCount = active lessons (excluding "rest" status)
 * - eventCount = events created for the day
 * - isComplete = eventCount === lessonCount (all lessons have events)
 */

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

export interface GlobalStats {
    teacherCount: number;
    totalLessons: number;
    totalEvents: number;
    totalStudents: number;
    totalHours: number;
    totalEarnings: {
        teacher: number;
        school: number;
        total: number;
    };
    isComplete: boolean;
    completionPercentage: number;
}

export class ClassboardStats {
    private teacherStats: TeacherStats[];

    constructor(teacherStats: TeacherStats[]) {
        this.teacherStats = teacherStats;
    }

    getGlobalStats(): GlobalStats {
        const teacherCount = this.teacherStats.length;
        const totalLessons = this.teacherStats.reduce((sum, stats) => sum + stats.lessonCount, 0);
        const totalEvents = this.teacherStats.reduce((sum, stats) => sum + stats.eventCount, 0);
        const totalHours = this.teacherStats.reduce((sum, stats) => sum + stats.totalHours, 0);
        const totalStudents = this.teacherStats.reduce((sum, stats) => sum + stats.studentCount, 0);

        const totalEarnings = this.teacherStats.reduce(
            (acc, stats) => ({
                teacher: acc.teacher + stats.earnings.teacher,
                school: acc.school + stats.earnings.school,
                total: acc.total + stats.earnings.total,
            }),
            { teacher: 0, school: 0, total: 0 }
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
            totalEarnings: {
                teacher: Math.round(totalEarnings.teacher * 100) / 100,
                school: Math.round(totalEarnings.school * 100) / 100,
                total: Math.round(totalEarnings.total * 100) / 100,
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
