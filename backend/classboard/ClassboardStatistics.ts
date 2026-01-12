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

import type { TeacherQueue } from "@/backend/classboard/TeacherQueue";
import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";
import type { TransactionEventData } from "@/types/transaction-event";

export interface RevenueStats {
    commission: number;
    revenue: number;
    profit: number;
}

/**
 * TeacherStats - Per-teacher statistics from their event queue
 * Calculated from TeacherQueue.getStats()
 */
export interface TeacherStats {
    eventCount: number;
    studentCount: number;
    totalHours: number;
    totalRevenue: RevenueStats;
}

export interface DailyLessonStats {
    teacherCount: number;
    studentCount: number;
    eventCount: number;
    durationCount: number; // in minutes
    revenue: RevenueStats;
}

export class ClassboardStatistics {
    private teacherQueues: TeacherQueue[] | null;
    private classboardData: ClassboardModel | null;
    private dateFilter?: string;
    private countAllEvents: boolean;

    constructor(
        teacherQueuesOrData: TeacherQueue[] | ClassboardModel,
        classboardDataOrDateFilter?: ClassboardModel | string,
        dateFilterOrCountAll?: string | boolean,
        countAllEvents = false,
    ) {
        // Distinguish between TeacherQueue[] and ClassboardModel (both are arrays)
        // ClassboardModel elements have 'booking' property, TeacherQueue has 'teacher'
        const isTeacherQueues =
            Array.isArray(teacherQueuesOrData) &&
            teacherQueuesOrData.length > 0 &&
            "teacher" in teacherQueuesOrData[0] &&
            typeof (teacherQueuesOrData[0] as any).getStats === "function";

        if (isTeacherQueues) {
            // First signature: TeacherQueue[] with optional ClassboardModel
            this.teacherQueues = teacherQueuesOrData as TeacherQueue[];
            this.classboardData =
                typeof classboardDataOrDateFilter === "object" && classboardDataOrDateFilter !== null
                    ? classboardDataOrDateFilter
                    : null;
            this.dateFilter = typeof dateFilterOrCountAll === "string" ? dateFilterOrCountAll : undefined;
            this.countAllEvents = typeof dateFilterOrCountAll === "boolean" ? dateFilterOrCountAll : countAllEvents;
        } else {
            // Second signature: ClassboardModel alone
            this.teacherQueues = null;
            this.classboardData = Array.isArray(teacherQueuesOrData) ? teacherQueuesOrData : null;
            this.dateFilter = typeof classboardDataOrDateFilter === "string" ? classboardDataOrDateFilter : undefined;
            this.countAllEvents = typeof dateFilterOrCountAll === "boolean" ? dateFilterOrCountAll : false;
        }
    }

    /**
     * Get detailed transaction events with financial data
     * Single source of truth for revenue/commission calculation per event
     */
    getAllEventsWithFinancials(currency: string): TransactionEventData[] {
        if (!this.classboardData) return [];

        const events: TransactionEventData[] = [];

        Object.values(this.classboardData).forEach((booking) => {
            const { bookingStudents, lessons, schoolPackage } = booking;
            const leaderStudent = bookingStudents[0]?.student;
            const leaderStudentName = leaderStudent ? `${leaderStudent.firstName} ${leaderStudent.lastName}` : "Unknown";
            const studentCount = bookingStudents.length;
            const studentNames = bookingStudents.map((bs) => `${bs.student.firstName} ${bs.student.lastName}`);

            lessons.forEach((lesson) => {
                lesson.events.forEach((event) => {
                    // Apply date filter if provided
                    if (this.dateFilter && !event.date.startsWith(this.dateFilter)) {
                        return;
                    }

                    // Count events based on the flag
                    const shouldCountEvent = this.countAllEvents || event.status === "completed" || event.status === "uncompleted";

                    if (shouldCountEvent) {
                        const durationHours = event.duration / 60;
                        const studentRevenue = schoolPackage.pricePerStudent * durationHours * studentCount;
                        const cph = parseFloat(lesson.commission.cph) || 0;

                        let teacherEarnings = 0;
                        if (lesson.commission.type === "fixed") {
                            teacherEarnings = cph * durationHours;
                        } else {
                            teacherEarnings = studentRevenue * (cph / 100);
                        }

                        events.push({
                            event: {
                                id: event.id,
                                lessonId: event.lessonId,
                                date: event.date,
                                duration: event.duration,
                                location: event.location,
                                status: event.status,
                            },
                            teacher: {
                                id: lesson.teacher.id,
                                username: lesson.teacher.username,
                            },
                            leaderStudentName,
                            studentCount,
                            studentNames,
                            packageData: {
                                description: schoolPackage.description,
                                pricePerStudent: schoolPackage.pricePerStudent,
                                durationMinutes: schoolPackage.durationMinutes,
                                categoryEquipment: schoolPackage.categoryEquipment,
                                capacityEquipment: schoolPackage.capacityEquipment,
                                capacityStudents: schoolPackage.capacityStudents,
                            },
                            financials: {
                                teacherEarnings,
                                studentRevenue,
                                profit: studentRevenue - teacherEarnings,
                                currency: currency,
                                commissionType: lesson.commission.type as "fixed" | "percentage",
                                commissionValue: cph,
                            },
                            equipments: (event as any).equipments || [],
                        });
                    }
                });
            });
        });

        return events.sort((a, b) => a.event.date.localeCompare(b.event.date));
    }

    /**
     * Get daily lesson statistics from teacher queues or classboard data
     */
    getDailyLessonStats(): DailyLessonStats {
        if (this.teacherQueues) {
            // Calculate stats from TeacherQueue[] events
            const activeTeacherStats = this.teacherQueues
                .map((queue) => queue.getStats({ includeDeleted: this.countAllEvents }))
                .filter((stats) => stats.eventCount > 0);

            const teacherCount = activeTeacherStats.length;
            const studentCount = activeTeacherStats.reduce((sum, stats) => sum + stats.studentCount, 0);
            const eventCount = activeTeacherStats.reduce((sum, stats) => sum + stats.eventCount, 0);
            // totalHours is already in hours, convert to minutes for durationCount
            const durationCount = activeTeacherStats.reduce((sum, stats) => sum + stats.totalHours * 60, 0);
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
                            const hours = event.duration / 60;
                            const revenue = booking.schoolPackage.pricePerStudent * studentCount * hours;
                            totalRevenue += revenue;

                            // Calculate commission
                            const commissionPerHour = parseFloat(lesson.commission.cph);
                            let commission = 0;
                            if (lesson.commission.type === "fixed") {
                                commission = commissionPerHour * hours;
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
