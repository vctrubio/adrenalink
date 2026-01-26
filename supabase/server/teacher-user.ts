import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { logger } from "@/backend/logger";
import { safeArray } from "@/backend/error-handlers";
import { lessonsToTransactionEvents, groupTransactionsByLesson } from "@/getters/booking-lesson-event-getter";
import type { TransactionEventData, TransactionEventStudent, TransactionEventEquipment } from "@/types/transaction-event";

/**
 * Comprehensive teacher user data with ALL relations.
 * Single source of truth for teacher user routes.
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
                            id,
                            description,
                            category_equipment,
                            capacity_equipment,
                            price_per_student,
                            duration_minutes
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

        // 1. Transform raw lessons to atomic TransactionEventData objects
        const transactions = lessonsToTransactionEvents(safeArray(teacher.lesson), currency);

        // Sort transactions by date descending (newest first)
        transactions.sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());

        // 2. Map payments for grouping
        const lessonPaymentsMap: Record<string, number> = {};
        safeArray(teacher.lesson).forEach(l => {
            lessonPaymentsMap[l.id] = safeArray(l.teacher_lesson_payment).reduce(
                (sum: number, p: any) => sum + (p.amount || 0),
                0
            );
        });

        // 3. Group transactions into LessonRows
        const lessonRows = groupTransactionsByLesson(transactions, lessonPaymentsMap);

        // 4. Process teacher equipment
        const equipment = safeArray(teacher.teacher_equipment).map((te: any) => ({
            id: te.id,
            teacher_id: te.teacher_id,
            equipment_id: te.equipment_id,
            active: te.active,
            created_at: te.created_at,
            updated_at: te.updated_at,
            equipment: te.equipment,
        }));

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
            transactions,
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
    transactions: TransactionEventData[]; // Flat list for schedule
    lessonRows: any[]; // Grouped list for history (LessonRow type inferred from getter)
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