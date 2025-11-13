import { calculateCommission, calculateLessonRevenue, calculateSchoolProfit } from "@/getters/commission-calculator";
import type { EventNode } from "@/backend/TeacherQueue";
import type { TeacherStats } from "@/backend/ClassboardStats";

export function getStudentCountFromEvent(eventNode: EventNode): number {
    return eventNode.studentNames.length;
}

export function calculateTeacherStatsFromEvents(
    teacherUsername: string,
    eventNodes: EventNode[],
    lessonCount: number
): TeacherStats {
    let totalDuration = 0;
    let teacherEarnings = 0;
    let schoolRevenue = 0;
    let studentCount = 0;

    eventNodes.forEach((eventNode) => {
        try {
            totalDuration += eventNode.eventData.duration;

            const studentCountForEvent = getStudentCountFromEvent(eventNode);
            studentCount += studentCountForEvent;

            const lessonRevenue = calculateLessonRevenue(
                eventNode.packagePricePerStudent,
                studentCountForEvent,
                eventNode.eventData.duration,
                eventNode.packageDurationMinutes
            );

            const commissionCalc = calculateCommission(
                eventNode.eventData.duration,
                eventNode.commission,
                lessonRevenue,
                eventNode.packageDurationMinutes
            );
            teacherEarnings += commissionCalc.earned;

            const profit = calculateSchoolProfit(lessonRevenue, commissionCalc.earned);
            schoolRevenue += profit;
        } catch (error) {
            console.warn(`Skipping event ${eventNode.lessonId} due to missing data:`, error);
        }
    });

    return {
        teacherUsername,
        lessonCount,
        eventCount: eventNodes.length,
        studentCount,
        totalDuration,
        totalHours: Math.round((totalDuration / 60) * 10) / 10,
        earnings: {
            teacher: Math.round(teacherEarnings * 100) / 100,
            school: Math.round(schoolRevenue * 100) / 100,
            total: Math.round((teacherEarnings + schoolRevenue) * 100) / 100,
        },
    } as any;
}
