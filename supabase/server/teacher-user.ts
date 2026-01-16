import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { convertUTCToSchoolTimezone } from "@/getters/timezone-getter";
import { headers } from "next/headers";
import type { EventNode } from "@/types/classboard-teacher-queue";
import type { TransactionEventData } from "@/types/transaction-event";
import { logger } from "@/backend/logger";

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
        const headersList = await headers();
        let schoolId = headersList.get("x-school-id");
        let timezone = headersList.get("x-school-timezone");

        if (!schoolId) {
            const schoolHeader = await getSchoolHeader();
            if (!schoolHeader) {
                return { success: false, error: "School context not found" };
            }
            schoolId = schoolHeader.id;
            timezone = schoolHeader.timezone;
        } else if (!timezone) {
            const schoolHeader = await getSchoolHeader();
            if (schoolHeader) timezone = schoolHeader.timezone;
        }

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
                        school(
                            id,
                            name,
                            username,
                            currency
                        ),
                        school_package(
                            *
                        ),
                        booking_student(
                            student(*)
                        )
                    ),
                    event(*),
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

        const currency = teacher.lesson?.[0]?.booking?.school?.currency || "YEN";

        // Build EventNode array and TransactionEventData array
        const events: EventNode[] = [];
        const transactions: TransactionEventData[] = [];
        const lessonMap = new Map<string, LessonSummary>();

        for (const lesson of teacher.lesson || []) {
            const booking = lesson.booking;
            const commission = lesson.teacher_commission;
            const schoolPackage = booking?.school_package;

            if (!booking || !commission || !schoolPackage) continue;

            // Extract students
            const bookingStudents = (booking.booking_student || []).map((bs: any) => ({
                id: bs.student.id,
                firstName: bs.student.first_name,
                lastName: bs.student.last_name,
                passport: bs.student.passport,
                country: bs.student.country,
                phone: bs.student.phone,
            }));

            const studentNames = bookingStudents.map((s) => `${s.firstName} ${s.lastName}`.trim());

            // Track lesson for commissions grouping
            if (!lessonMap.has(lesson.id)) {
                lessonMap.set(lesson.id, {
                    lessonId: lesson.id,
                    commissionId: commission.id,
                    commissionType: commission.commission_type as "fixed" | "percentage",
                    cph: parseFloat(commission.cph || "0"),
                    eventCount: 0,
                    totalDuration: 0,
                    totalEarnings: 0,
                });
            }

            // Process events for this lesson
            for (const evt of lesson.event || []) {
                let eventDate = evt.date;
                if (timezone) {
                    const convertedDate = convertUTCToSchoolTimezone(new Date(evt.date), timezone);
                    eventDate = convertedDate.toISOString();
                }

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
                        date: eventDate,
                        duration: evt.duration,
                        location: evt.location,
                        status: evt.status as "planned" | "tbc" | "completed" | "uncompleted",
                    },
                    prev: null,
                    next: null,
                };

                events.push(eventNode);

                // Calculate financials for transaction
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

                // Build TransactionEventData for lessons page
                const transaction: TransactionEventData = {
                    event: {
                        id: evt.id,
                        lessonId: lesson.id,
                        date: eventDate,
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
                    financials: {
                        teacherEarnings,
                        studentRevenue,
                        profit,
                        currency,
                        commissionType: commission.commission_type as "fixed" | "percentage",
                        commissionValue: parseFloat(commission.cph || "0"),
                    },
                };

                transactions.push(transaction);

                // Update lesson summary for commissions
                const lessonSummary = lessonMap.get(lesson.id)!;
                lessonSummary.eventCount++;
                lessonSummary.totalDuration += evt.duration;
                lessonSummary.totalEarnings += teacherEarnings;
            }
        }

        // Process teacher equipment
        const equipment = (teacher.teacher_equipment || []).map((te: any) => ({
            id: te.id,
            teacher_id: te.teacher_id,
            equipment_id: te.equipment_id,
            active: te.active,
            created_at: te.created_at,
            updated_at: te.updated_at,
            equipment: te.equipment,
        }));

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
            commissions: teacher.teacher_commission || [],
            equipment,
            events,
            lessons: transactions,
            lessonSummaries: Array.from(lessonMap.values()),
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

export interface LessonSummary {
    lessonId: string;
    commissionId: string;
    commissionType: "fixed" | "percentage";
    cph: number;
    eventCount: number;
    totalDuration: number;
    totalEarnings: number;
}

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
    commissions: TeacherCommission[];
    equipment: TeacherEquipmentItem[];
    events: EventNode[];
    lessons: TransactionEventData[];
    lessonSummaries: LessonSummary[];
}

export interface TeacherCommission {
    id: string;
    teacher_id: string;
    commission_type: string;
    cph: string;
    description: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
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
