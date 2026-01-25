import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import type { EventNode } from "@/types/classboard-teacher-queue";
import type { BookingWithLessonAndPayments } from "@/config/tables";
import { calculateBookingStats } from "@/backend/data/BookingData";
import { logger } from "@/backend/logger";
import { safeArray } from "@/backend/error-handlers";

/**
 * Comprehensive student user data with ALL bookings and events
 * Single source of truth for student user routes
 */
export async function getStudentUser(studentId: string): Promise<{
    success: boolean;
    data?: StudentUserData;
    error?: string;
}> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }
        const schoolId = schoolHeader.id;

        const supabase = getServerConnection();

        // Fetch student with bookings, lessons, and events
        const { data: studentData, error: studentError } = await supabase
            .from("student")
            .select(
                `
                *,
                booking_student(
                    booking(
                        *,
                        school_package(*),
                        lesson(
                            *,
                            teacher(
                                id,
                                first_name,
                                last_name,
                                username
                            ),
                            teacher_commission(*),
                            event(*),
                            teacher_lesson_payment(*)
                        ),
                        student_booking_payment(*)
                    )
                )
            `,
            )
            .eq("id", studentId)
            .single();

        if (studentError || !studentData) {
            logger.error("Error fetching student user data", studentError);
            return { success: false, error: "Student not found" };
        }

        // Build bookings with stats and events
        const bookings: BookingWithProgress[] = [];
        const allEvents: StudentEvent[] = [];

        for (const bs of safeArray(studentData.booking_student)) {
            const booking = bs.booking;
            const schoolPackage = booking.school_package;

            if (!schoolPackage) continue;

            // Process lessons for booking
            const lessons = safeArray(booking.lesson).map((lesson: any) => {
                const totalDuration = safeArray(lesson.event).reduce((sum: number, e: any) => sum + (e.duration || 0), 0);
                const recordedPayments = safeArray(lesson.teacher_lesson_payment).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

                return {
                    id: lesson.id,
                    teacherId: lesson.teacher.id,
                    teacherUsername: lesson.teacher.username,
                    status: lesson.status,
                    commission: {
                        type: lesson.teacher_commission.commission_type as "fixed" | "percentage",
                        cph: lesson.teacher_commission.cph,
                    },
                    events: {
                        totalCount: safeArray(lesson.event).length,
                        totalDuration,
                        details: safeArray(lesson.event).map((e: any) => ({ status: e.status, duration: e.duration || 0 })),
                    },
                    teacherPayments: recordedPayments,
                };
            });

            // Calculate booking stats
            const bookingData: BookingWithLessonAndPayments = {
                package: {
                    description: schoolPackage.description || "",
                    categoryEquipment: schoolPackage.category_equipment || "",
                    capacityEquipment: schoolPackage.capacity_equipment || 0,
                    capacityStudents: schoolPackage.capacity_students || 1,
                    durationMinutes: schoolPackage.duration_minutes || 60,
                    pricePerStudent: schoolPackage.price_per_student || 0,
                    pph: schoolPackage.duration_minutes > 0 ? schoolPackage.price_per_student / (schoolPackage.duration_minutes / 60) : 0,
                },
                lessons,
                payments: safeArray(booking.student_booking_payment).map((p: any) => ({
                    student_id: studentId,
                    amount: p.amount || 0,
                })),
            };

            const stats = calculateBookingStats(bookingData);

            bookings.push({
                id: booking.id,
                status: booking.status,
                dateStart: booking.date_start,
                dateEnd: booking.date_end,
                packageName: schoolPackage.description || "",
                packageDetails: bookingData.package,
                stats,
            });

            // Extract all events for this student
            for (const lesson of safeArray(booking.lesson)) {
                const teacher = lesson.teacher;
                for (const evt of safeArray(lesson.event)) {
                    allEvents.push({
                        id: evt.id,
                        date: evt.date,
                        duration: evt.duration,
                        location: evt.location,
                        status: evt.status as "planned" | "tbc" | "completed" | "uncompleted",
                        teacher: {
                            id: teacher.id,
                            firstName: teacher.first_name,
                            lastName: teacher.last_name,
                            username: teacher.username,
                        },
                        packageDetails: {
                            description: schoolPackage.description || "",
                            categoryEquipment: schoolPackage.category_equipment || "",
                            capacityEquipment: schoolPackage.capacity_equipment || 0,
                            pricePerHour: bookingData.package.pph,
                        },
                    });
                }
            }
        }

        const studentUserData: StudentUserData = {
            student: {
                id: studentData.id,
                first_name: studentData.first_name,
                last_name: studentData.last_name,
                passport: studentData.passport,
                country: studentData.country,
                phone: studentData.phone,
                languages: studentData.languages,
                created_at: studentData.created_at,
                updated_at: studentData.updated_at,
            },
            bookings,
            events: allEvents,
        };

        return { success: true, data: studentUserData };
    } catch (error) {
        logger.error("Unexpected error in getStudentUser", error);
        return { success: false, error: "Failed to fetch student user data" };
    }
}

// ============================================================================
// Type Definitions
// ============================================================================

export interface StudentUserData {
    student: {
        id: string;
        first_name: string;
        last_name: string;
        passport: string;
        country: string;
        phone: string;
        languages: string[];
        created_at: string;
        updated_at: string;
    };
    bookings: BookingWithProgress[];
    events: StudentEvent[];
}

export interface BookingWithProgress {
    id: string;
    status: string;
    dateStart: string;
    dateEnd: string;
    packageName: string;
    packageDetails: {
        description: string;
        categoryEquipment: string;
        capacityEquipment: number;
        capacityStudents: number;
        durationMinutes: number;
        pricePerStudent: number;
        pph: number;
    };
    stats: {
        events: {
            count: number;
            duration: number;
            revenue: number;
            statusCounts: {
                planned: number;
                tbc: number;
                completed: number;
                uncompleted: number;
            };
        };
        payments: {
            student: number;
            teacher: number;
        };
        commissions: number;
        balance: number;
    };
}

export interface StudentEvent {
    id: string;
    date: string;
    duration: number;
    location: string;
    status: "planned" | "tbc" | "completed" | "uncompleted";
    teacher: {
        id: string;
        firstName: string;
        lastName: string;
        username: string;
    };
    packageDetails: {
        description: string;
        categoryEquipment: string;
        capacityEquipment: number;
        pricePerHour: number;
    };
}
