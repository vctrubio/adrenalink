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
    durationCount: number;  // in minutes
    revenue: RevenueStats;
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

    /**
     * Get daily lesson statistics from teacher queues or classboard data
     */
    getDailyLessonStats(): DailyLessonStats {
        if (this.teacherQueues) {
            // Use existing logic for TeacherQueue[]
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
                        if (this.dateFilter && !event.date.toISOString().startsWith(this.dateFilter)) {
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
                            } else { // percentage
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
