import type { EventNode } from "@/backend/classboard/TeacherQueue";
import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";

// Re-export shared stats logic from the single source of truth
export { getDashboardStatsDisplay, STATS_GROUP_TOP, STATS_GROUP_BOTTOM, STATS_GROUP_REVENUE, type DashboardStatKey, type DisplayableStat } from "@/backend/RenderStats";

/**
 * Transforms raw database booking data into ClassboardModel format
 * This is a pure data transformation function - belongs in getters
 */
export function createClassboardModel(bookingsData: any[]): ClassboardModel {
    return bookingsData.map((bookingData) => {
        const { id, dateStart, dateEnd, schoolId, leaderStudentName, studentPackage, bookingStudents, lessons } = bookingData;

        return {
            booking: {
                id,
                dateStart,
                dateEnd,
                leaderStudentName,
            },
            schoolPackage: studentPackage.schoolPackage,
            bookingStudents: bookingStudents.map((bs: any) => {
                const schoolStudentsArray = bs.student.schoolStudents || [];
                const schoolStudent = schoolStudentsArray.find((ss: any) => ss.schoolId === schoolId);

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
                teacher: lesson.teacher
                    ? {
                          id: lesson.teacher.id,
                          username: lesson.teacher.username,
                      }
                    : undefined,
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
    });
}
