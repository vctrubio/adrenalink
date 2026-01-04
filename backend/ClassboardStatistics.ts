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

import type { TeacherQueue } from "../src/app/(admin)/(classboard)/TeacherQueue";
import type { EventNode } from "@/types/classboard-teacher-queue";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";

export interface RevenueStats {
    commission: number;
    revenue: number;
    profit: number;
}

export interface DailyLessonStats {
    teacherCount: number;
    studentCount: number;
    eventCount: number;
    durationCount: number; // in minutes
    revenue: RevenueStats;
}

/**
 * TeacherStats - Per-teacher statistics computed from a queue or events
 */
export interface TeacherStats {
    eventCount: number;
    studentCount: number;
    totalHours: number; // in hours
    totalRevenue: RevenueStats;
}

export class ClassboardStatistics {
    private teacherQueues: TeacherQueue[] | null;
    private classboardData: ClassboardModel | null;
    private dateFilter?: string;
    private countAllEvents: boolean;

    constructor(input: TeacherQueue[] | ClassboardModel, dateFilter?: string, countAllEvents = false) {
        if (Array.isArray(input)) {
            this.teacherQueues = input;
            this.classboardData = null;
        } else {
            this.teacherQueues = null;
            this.classboardData = input;
        }
        this.dateFilter = dateFilter;
        this.countAllEvents = countAllEvents;
    }

    // Helper to compute stats from an array of EventNode
    private statsFromEvents(events: EventNode[] = []): TeacherStats {
        const uniqueStudents = new Set<string>();
        let totalDurationMinutes = 0;
        let totalRevenue = 0;
        let totalCommission = 0;

        const safeEvents = events.filter(Boolean);

        safeEvents.forEach((event) => {
            // duration
            const duration = event.eventData?.duration ?? 0;
            totalDurationMinutes += duration;

            // students
            const bookingStudents = event.bookingStudents ?? [];
            bookingStudents.forEach((s) => {
                if (s?.id) uniqueStudents.add(s.id);
                else if ((s as any)?.student?.id) uniqueStudents.add((s as any).student.id);
            });

            // revenue
            const pricePerStudent = event.pricePerStudent ?? 0;
            const capacity = event.capacityStudents ?? bookingStudents.length ?? 0;
            const eventRevenue = pricePerStudent * capacity;
            totalRevenue += eventRevenue;

            // commission
            const cph = event.commission?.cph ?? 0;
            if (event.commission?.type === "fixed") {
                totalCommission += (cph * (duration / 60));
            } else {
                totalCommission += eventRevenue * (cph / 100);
            }
        });

        const totalHours = Math.round((totalDurationMinutes / 60) * 100) / 100;

        return {
            eventCount: safeEvents.length,
            studentCount: uniqueStudents.size,
            totalHours,
            totalRevenue: {
                revenue: Math.round(totalRevenue * 100) / 100,
                commission: Math.round(totalCommission * 100) / 100,
                profit: Math.round((totalRevenue - totalCommission) * 100) / 100,
            },
        };
    }

    /**
     * Get daily lesson statistics from teacher queues or classboard data
     */
    getDailyLessonStats(): DailyLessonStats {
        if (this.teacherQueues) {
            // Normalize queues to `TeacherStats` using available shapes
            const normalizeStats = (queue: unknown): TeacherStats | null => {
                try {
                    const q: any = queue as any;
                    if (typeof q?.getStats === "function") {
                        const s = q.getStats();
                        // quick shape check
                        if (s && typeof s.eventCount === "number") return s as TeacherStats;
                    }

                    if (typeof q?.getAllEvents === "function") return this.statsFromEvents(q.getAllEvents());
                    if (Array.isArray((q as any).events)) return this.statsFromEvents((q as any).events as EventNode[]);
                    if (q && typeof (q as any).eventCount === "number") return q as TeacherStats;
                } catch (e) {
                    // ignore and fallthrough
                }
                return null;
            };

            const activeTeacherStats = this.teacherQueues
                .map(normalizeStats)
                .filter((s): s is TeacherStats => s !== null && s.eventCount > 0);

            const teacherCount = activeTeacherStats.length;
            const studentCount = activeTeacherStats.reduce((sum, stats) => sum + stats.studentCount, 0);
            const eventCount = activeTeacherStats.reduce((sum, stats) => sum + stats.eventCount, 0);
            const durationCount = Math.round(activeTeacherStats.reduce((sum, stats) => sum + stats.totalHours, 0) * 60 * 10) / 10; // minutes rounded to 0.1
            const totalRevenue = activeTeacherStats.reduce((sum, stats) => sum + stats.totalRevenue.revenue, 0);
            const totalCommission = activeTeacherStats.reduce((sum, stats) => sum + stats.totalRevenue.commission, 0);
            const totalProfit = activeTeacherStats.reduce((sum, stats) => sum + stats.totalRevenue.profit, 0);

            return {
                teacherCount,
                studentCount,
                eventCount,
                durationCount,
                revenue: {
                    commission: Math.round(totalCommission * 100) / 100,
                    revenue: Math.round(totalRevenue * 100) / 100,
                    profit: Math.round(totalProfit * 100) / 100,
                },
            };
        } else if (this.classboardData) {
            // Calculate stats directly from ClassboardModel
            const uniqueTeachers = new Set<string>();
            const uniqueStudents = new Set<string>();
            let totalEvents = 0;
            let totalDuration = 0;
            let totalRevenue = 0;
            let totalCommission = 0;

            Object.values(this.classboardData).forEach((booking) => {
                booking.lessons.forEach((lesson) => {
                    lesson.events.forEach((event) => {
                        // Apply date filter if provided
                        if (this.dateFilter && !event.date.startsWith(this.dateFilter)) {
                            return;
                        }

                        // Count events based on the flag
                        const shouldCountEvent = this.countAllEvents || event.status === "completed" || event.status === "uncompleted";

                        if (shouldCountEvent) {
                            // Track unique teachers (only for events on the filtered date)
                            uniqueTeachers.add(lesson.teacher.username);

                            totalEvents += 1;
                            totalDuration += event.duration;

                            // Track unique students
                            booking.bookingStudents.forEach((student) => {
                                uniqueStudents.add(student.student.id);
                            });

                            // Calculate revenue and commission
                            const studentCount = booking.bookingStudents.length;
                            const revenue = booking.schoolPackage.pricePerStudent * studentCount;
                            totalRevenue += revenue;

                            // Calculate commission
                            const commissionPerHour = parseFloat(lesson.commission.cph);
                            const hours = event.duration / 60;
                            let commission = 0;
                            if (lesson.commission.type === "fixed") {
                                commission = commissionPerHour;
                            } else {
                                // percentage
                                commission = revenue * (commissionPerHour / 100);
                            }
                            totalCommission += commission;
                        }
                    });
                });
            });

            const totalProfit = totalRevenue - totalCommission;

            return {
                teacherCount: uniqueTeachers.size,
                studentCount: uniqueStudents.size,
                eventCount: totalEvents,
                durationCount: totalDuration,
                revenue: {
                    commission: Math.round(totalCommission * 100) / 100,
                    revenue: Math.round(totalRevenue * 100) / 100,
                    profit: Math.round(totalProfit * 100) / 100,
                },
            };
        } else {
            throw new Error("No data provided to ClassboardStatistics");
        }
    }
}
