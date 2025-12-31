/**
 * ClassboardStatistics - Computes statistics from ClassboardModel for a specific date
 * 
 * Stats computed:
 * - students: unique students with bookings on the date
 * - teachers: teachers with lessons on bookings
 * - lessons: total lesson count (excluding "rest" status)
 * - duration: total event duration in minutes for the date
 * - commissions: total teacher commissions for the date
 * - revenue: total school revenue for the date
 */

import type { ClassboardModel, ClassboardLesson } from "@/backend/models/ClassboardModel";

export interface ClassboardHeaderStats {
    students: number;
    teachers: number;
    lessons: number;
    duration: number;       // in minutes
    commissions: number;    // currency amount
    revenue: number;        // currency amount
}

export class ClassboardStatistics {
    private model: ClassboardModel;
    private selectedDate: string;

    constructor(model: ClassboardModel, selectedDate: string) {
        this.model = model;
        this.selectedDate = selectedDate;
    }

    /**
     * Get all stats for the header display
     */
    getHeaderStats(): ClassboardHeaderStats {
        let studentCount = 0;
        const teacherUsernames = new Set<string>();
        let lessonCount = 0;
        let totalDuration = 0;
        let totalCommissions = 0;
        let totalRevenue = 0;

        // Iterate through all bookings
        Object.values(this.model).forEach((bookingData) => {
            const { bookingStudents, lessons, schoolPackage } = bookingData;
            
            // Check if this booking has events on selected date
            const hasEventsToday = lessons.some((lesson) => 
                lesson.events.some((event) => this.isEventOnDate(event.date))
            );

            if (!hasEventsToday) return;

            // Count students for bookings with events today
            studentCount += bookingStudents.length;

            // Process lessons
            lessons.forEach((lesson) => {
                // Skip "rest" status lessons
                if (lesson.status === "rest") return;

                // Get events for today
                const todayEvents = lesson.events.filter((event) => 
                    this.isEventOnDate(event.date)
                );

                if (todayEvents.length === 0) return;

                // Count this teacher
                teacherUsernames.add(lesson.teacher.username);

                // Count lesson (once per teacher-booking combo with events today)
                lessonCount++;

                // Sum duration
                const lessonDuration = todayEvents.reduce((sum, e) => sum + (e.duration || 0), 0);
                totalDuration += lessonDuration;

                // Calculate commission
                const { commissionAmount, revenueAmount } = this.calculateEarnings(
                    lesson,
                    lessonDuration,
                    schoolPackage.pricePerStudent,
                    bookingStudents.length
                );

                totalCommissions += commissionAmount;
                totalRevenue += revenueAmount;
            });
        });

        return {
            students: studentCount,
            teachers: teacherUsernames.size,
            lessons: lessonCount,
            duration: totalDuration,
            commissions: Math.round(totalCommissions * 100) / 100,
            revenue: Math.round(totalRevenue * 100) / 100,
        };
    }

    /**
     * Check if an event date matches the selected date
     */
    private isEventOnDate(eventDate: string | Date | null): boolean {
        if (!eventDate) return false;
        const dateStr = new Date(eventDate).toISOString().split("T")[0];
        return dateStr === this.selectedDate;
    }

    /**
     * Calculate commission and revenue for a lesson's duration
     */
    private calculateEarnings(
        lesson: ClassboardLesson,
        durationMinutes: number,
        pricePerStudent: number,
        studentCount: number
    ): { commissionAmount: number; revenueAmount: number } {
        const hours = durationMinutes / 60;
        const cph = parseFloat(lesson.commission.cph) || 0;

        // Total revenue = price per student * hours * student count
        const revenueAmount = pricePerStudent * hours * studentCount;

        let commissionAmount = 0;
        if (lesson.commission.type === "fixed") {
            // Fixed: commission = cph * hours
            commissionAmount = cph * hours;
        } else {
            // Percentage: commission = revenue * (cph / 100)
            commissionAmount = revenueAmount * (cph / 100);
        }

        return { commissionAmount, revenueAmount };
    }
}
