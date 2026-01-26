import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import type { EventNode } from "@/types/classboard-teacher-queue";
import type { TransactionEventData } from "@/types/transaction-event";
import { logger } from "@/backend/logger";
import { safeArray } from "@/backend/error-handlers";
import type { LessonStatus, EventStatus } from "@/supabase/db/enums";
import { groupEventsByLesson, transactionEventToTimelineEvent } from "@/getters/teacher-lesson-getter";
import type { LessonRow } from "@/backend/data/TeacherLessonData";

/**
 * Comprehensive teacher user data with ALL relations
 * Single source of truth for teacher user routes
 */
export async function getTeacherUser(teacherId: string): Promise<{
    success: boolean;
    data?: TeacherUserData;
    error?: string;
}> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }
        const schoolId = schoolHeader.id;

        const supabase = getServerConnection();

        // Fetch teacher with COMPLETE relations
        const { data: teacher, error: teacherError } = await supabase
            .from("teacher")
            .select(
                `
                *,
                teacher_commission(*),
                teacher_equipment(
                    *,
                    equipment(*)
                ),
                lesson(
                    *,
                    teacher_commission(*),
                    booking(
                        *,
                        school_package(
                            *
                        ),
                        booking_student(
                            student(*)
                        )
                    ),
                    event(
                        *,
                        equipment_event(
                            equipment_id,
                            equipment(
                                id,
                                sku,
                                brand,
                                model,
                                color,
                                size,
                                category,
                                status
                            )
                        )
                    ),
                    teacher_lesson_payment(*)
                )
            `,
            )
            .eq("id", teacherId)
            .eq("school_id", schoolId)
            .single();

        if (teacherError || !teacher) {
            logger.error("Error fetching teacher user data", teacherError);
            return { success: false, error: "Teacher not found" };
        }

        const currency = schoolHeader.currency || "YEN";

        // Build EventNode array for events page and TransactionEventData array for lessonRows
        const events: EventNode[] = [];
        const transactions: TransactionEventData[] = [];
        const lessonPaymentsMap = new Map<string, number>();

        for (const lesson of safeArray(teacher.lesson)) {
            // Calculate total payments for this lesson
            const totalPayments = safeArray(lesson.teacher_lesson_payment).reduce(
                (sum: number, p: any) => sum + (p.amount || 0),
                0
            );
            lessonPaymentsMap.set(lesson.id, totalPayments);
            const booking = lesson.booking;
            const commission = lesson.teacher_commission;
            const schoolPackage = booking?.school_package;

            if (!booking || !commission || !schoolPackage) continue;

            // Extract students
            const bookingStudents = safeArray(booking.booking_student).map((bs: any) => ({
                id: bs.student.id,
                firstName: bs.student.first_name,
                lastName: bs.student.last_name,
                passport: bs.student.passport,
                country: bs.student.country,
                phone: bs.student.phone,
            }));

            const studentNames = bookingStudents.map((s) => `${s.firstName} ${s.lastName}`.trim());

            // Process events for this lesson
            for (const evt of safeArray(lesson.event)) {
                // Build EventNode for events page
                const eventNode: EventNode = {
                    id: evt.id,
                    lessonId: lesson.id,
                    bookingId: booking.id,
                    bookingLeaderName: booking.leader_student_name,
                    bookingStudents,
                    capacityStudents: schoolPackage.capacity_students || 1,
                    pricePerStudent: schoolPackage.price_per_student || 0,
                    packageDuration: schoolPackage.duration_minutes || 60,
                    categoryEquipment: schoolPackage.category_equipment || "",
                    capacityEquipment: schoolPackage.capacity_equipment || 0,
                    commission: {
                        type: commission.commission_type as "fixed" | "percentage",
                        cph: parseFloat(commission.cph || "0"),
                    },
                    eventData: {
                        date: evt.date,
                        duration: evt.duration,
                        location: evt.location || "",
                        status: evt.status as EventStatus,
                    },
                    lessonStatus: lesson.status as LessonStatus,
                    prev: null,
                    next: null,
                };

                events.push(eventNode);

                // Build TransactionEventData for lessonRows
                const hours = evt.duration / 60;
                const studentCount = bookingStudents.length;
                const studentRevenue = schoolPackage.price_per_student * studentCount * hours;

                let teacherEarnings = 0;
                if (commission.commission_type === "fixed") {
                    teacherEarnings = parseFloat(commission.cph || "0") * hours;
                } else {
                    teacherEarnings = studentRevenue * (parseFloat(commission.cph || "0") / 100);
                }

                const profit = studentRevenue - teacherEarnings;

                // Map equipments from equipment_event relation
                const equipments = safeArray(evt.equipment_event).map((ee: any) => ({
                    id: ee.equipment?.id || "",
                    brand: ee.equipment?.brand || "",
                    model: ee.equipment?.model || "",
                    size: ee.equipment?.size || null,
                    sku: ee.equipment?.sku,
                    color: ee.equipment?.color,
                }));

                const transaction: TransactionEventData = {
                    event: {
                        id: evt.id,
                        lessonId: lesson.id,
                        date: evt.date,
                        duration: evt.duration,
                        location: evt.location,
                        status: evt.status,
                    },
                    teacher: {
                        username: teacher.username,
                    },
                    leaderStudentName: booking.leader_student_name,
                    studentCount,
                    studentNames,
                    packageData: {
                        description: schoolPackage.description || "",
                        pricePerStudent: schoolPackage.price_per_student,
                        durationMinutes: schoolPackage.duration_minutes,
                        categoryEquipment: schoolPackage.category_equipment || "",
                        capacityEquipment: schoolPackage.capacity_equipment || 0,
                        capacityStudents: schoolPackage.capacity_students || 1,
                    },
                    commission: {
                        id: commission.id,
                        type: commission.commission_type as "fixed" | "percentage",
                        cph: parseFloat(commission.cph || "0"),
                        description: commission.description || null,
                    },
                    financials: {
                        teacherEarnings,
                        studentRevenue,
                        profit,
                        currency,
                        commissionType: commission.commission_type as "fixed" | "percentage",
                        commissionValue: parseFloat(commission.cph || "0"),
                    },
                    equipments: equipments.length > 0 ? equipments : undefined,
                    lessonStatus: lesson.status,
                    bookingStatus: booking.status,
                    bookingId: booking.id,
                };

                transactions.push(transaction);
            }
        }

        // Process teacher equipment
        const equipment = safeArray(teacher.teacher_equipment).map((te: any) => ({
            id: te.id,
            teacher_id: te.teacher_id,
            equipment_id: te.equipment_id,
            active: te.active,
            created_at: te.created_at,
            updated_at: te.updated_at,
            equipment: te.equipment,
        }));

        // Pre-compute lessonRows for DRY usage across components
        const lessonPayments = Object.fromEntries(lessonPaymentsMap);
        const lessonGroups = groupEventsByLesson(transactions);
        const lessonRows: LessonRow[] = lessonGroups.map((group) => {
            // Calculate total revenue from all events
            const totalRevenue = group.events.reduce((sum, e) => sum + e.financials.studentRevenue, 0);
            // Get actual teacher payments for this lesson
            const totalPayments = lessonPayments[group.lessonId] || 0;

            return {
                lessonId: group.lessonId,
                bookingId: group.bookingId,
                leaderName: group.leaderName,
                dateStart: group.dateStart,
                dateEnd: group.dateEnd,
                lessonStatus: group.lessonStatus,
                bookingStatus: group.bookingStatus,
                commissionType: group.commissionType,
                cph: group.cph,
                commissionDescription: group.commissionDescription,
                totalDuration: group.totalDuration,
                totalHours: group.totalHours,
                totalEarning: group.totalEarning,
                totalRevenue,
                totalPayments,
                eventCount: group.eventCount,
                events: group.events.map(transactionEventToTimelineEvent),
                equipmentCategory: group.equipmentCategory,
                studentCapacity: group.studentCapacity,
            };
        });

        // Build teacher user data
        const teacherUserData: TeacherUserData = {
            teacher: {
                id: teacher.id,
                school_id: teacher.school_id,
                first_name: teacher.first_name,
                last_name: teacher.last_name,
                username: teacher.username,
                passport: teacher.passport,
                country: teacher.country,
                phone: teacher.phone,
                languages: teacher.languages,
                active: teacher.active,
                created_at: teacher.created_at,
                updated_at: teacher.updated_at,
            },
            equipment,
            events,
            lessonPayments,
            lessonRows,
        };

        return { success: true, data: teacherUserData };
    } catch (error) {
        logger.error("Unexpected error in getTeacherUser", error);
        return { success: false, error: "Failed to fetch teacher user data" };
    }
}

// ============================================================================
// Type Definitions
// ============================================================================

export interface TeacherUserData {
    teacher: {
        id: string;
        school_id: string;
        first_name: string;
        last_name: string;
        username: string;
        passport: string;
        country: string;
        phone: string;
        languages: string[];
        active: boolean;
        created_at: string;
        updated_at: string;
    };
    equipment: TeacherEquipmentItem[];
    events: EventNode[];
    lessonPayments: Record<string, number>; // lessonId -> total payments
    lessonRows: LessonRow[]; // Pre-computed lesson rows for DRY usage
}

export interface TeacherEquipmentItem {
    id: string;
    teacher_id: string;
    equipment_id: string;
    active: boolean;
    created_at: string;
    updated_at: string;
    equipment: Equipment;
}

export interface Equipment {
    id: string;
    sku: string;
    brand: string;
    model: string;
    color: string | null;
    size: number | null;
    status: string;
    school_id: string;
    category: string;
    created_at: string;
    updated_at: string;
}
