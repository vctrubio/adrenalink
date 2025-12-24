import { calculateCommission, calculateLessonRevenue, calculateSchoolProfit } from "@/getters/commission-calculator";
import type { EventNode } from "@/backend/TeacherQueue";
import type { TeacherStats } from "@/backend/ClassboardStats";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";

export function getStudentCountFromEvent(eventNode: EventNode): number {
    return eventNode.studentData.length;
}

/**
 * Transforms raw database booking data into ClassboardModel format
 * This is a pure data transformation function - belongs in getters
 */
export function createClassboardModel(bookingsData: any[]): ClassboardModel {
    const result: ClassboardModel = {};

    for (const bookingData of bookingsData) {
        const { id, dateStart, dateEnd, schoolId, leaderStudentName, studentPackage, bookingStudents, lessons } = bookingData;

        result[id] = {
            booking: {
                id,
                dateStart,
                dateEnd,
                schoolId,
                leaderStudentName,
            },
            schoolPackage: studentPackage.schoolPackage,
            bookingStudents: bookingStudents.map((bs: any) => {
                // Find the schoolStudent entry for this school
                const schoolStudentsArray = bs.student.schoolStudents || [];
                const schoolStudent = schoolStudentsArray.find(
                    (ss: any) => ss.schoolId === schoolId
                );
                
                return {
                    student: {
                        id: bs.student.id,
                        firstName: bs.student.firstName,
                        lastName: bs.student.lastName,
                        passport: bs.student.passport || "",
                        country: bs.student.country || "",
                        phone: bs.student.phone || "",
                        languages: bs.student.languages || [],
                        description: schoolStudent?.description || null,
                    },
                };
            }),
            lessons: lessons.map((lesson: any) => ({
                id: lesson.id,
                teacher: {
                    username: lesson.teacher.username,
                    firstName: lesson.teacher.firstName,
                    lastName: lesson.teacher.lastName,
                },
                status: lesson.status,
                commission: {
                    id: lesson.commission.id,
                    type: lesson.commission.commissionType as "fixed" | "percentage",
                    cph: lesson.commission.cph,
                    description: lesson.commission.description,
                },
                events: lesson.events.map((event: any) => ({
                    id: event.id,
                    date: event.date,
                    duration: event.duration,
                    location: event.location,
                    status: event.status,
                })),
            })),
        };
    }

    return result;
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
                eventNode.packageData.pricePerStudent,
                studentCountForEvent,
                eventNode.eventData.duration,
                eventNode.packageData.durationMinutes
            );

            const commissionCalc = calculateCommission(
                eventNode.eventData.duration,
                eventNode.commission,
                lessonRevenue,
                eventNode.packageData.durationMinutes
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

