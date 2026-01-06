import type { EventNode } from "@/backend/classboard/TeacherQueue";
import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";

// Re-export shared stats logic from the single source of truth
export { getDashboardStatsDisplay, STATS_GROUP_TOP, STATS_GROUP_BOTTOM, STATS_GROUP_REVENUE, type DashboardStatKey, type DisplayableStat } from "@/backend/RenderStats";

/**
 * Transforms raw database booking data into ClassboardModel format
 * This is a pure data transformation function - belongs in getters
 * Handles snake_case fields from Supabase PostgREST API
 */
export function createClassboardModel(bookingsData: any[]): ClassboardModel {
    return bookingsData.map((bookingData) => {
        const { id, date_start, date_end, school_id, leader_student_name, school_package, booking_student, lesson } = bookingData;

        return {
            booking: {
                id,
                dateStart: date_start,
                dateEnd: date_end,
                leaderStudentName: leader_student_name,
            },
            schoolPackage: {
                id: school_package.id,
                durationMinutes: school_package.duration_minutes,
                description: school_package.description,
                pricePerStudent: school_package.price_per_student,
                capacityStudents: school_package.capacity_students,
                capacityEquipment: school_package.capacity_equipment,
                categoryEquipment: school_package.category_equipment,
            },
            bookingStudents: booking_student.map((bs: any) => ({
                student: {
                    id: bs.student.id,
                    firstName: bs.student.first_name,
                    lastName: bs.student.last_name,
                    passport: bs.student.passport || "",
                    country: bs.student.country || "",
                    phone: bs.student.phone || "",
                    languages: bs.student.languages || [],
                    description: null, // school_student reference not available in this query
                },
            })),
            lessons: lesson.map((les: any) => ({
                id: les.id,
                teacher: les.teacher
                    ? {
                          id: les.teacher.id,
                          username: les.teacher.username,
                      }
                    : undefined,
                status: les.status,
                commission: {
                    id: les.teacher_commission.id,
                    type: les.teacher_commission.commission_type as "fixed" | "percentage",
                    cph: les.teacher_commission.cph,
                    description: les.teacher_commission.description,
                },
                events: les.event.map((evt: any) => ({
                    id: evt.id,
                    date: evt.date,
                    duration: evt.duration,
                    location: evt.location,
                    status: evt.status,
                })),
            })),
        };
    });
}
