"use server";

import { getServerConnection } from "@/supabase/connection";
import { handleSupabaseError } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

const ENTITY_TABLE_MAP: Record<string, string> = {
    // From entities.ts
    school: "school",
    student: "student",
    schoolPackage: "school_package",
    studentPackage: "student_package",
    teacher: "teacher",
    commission: "teacher_commission",
    booking: "booking",
    lesson: "lesson",
    event: "event",
    equipment: "equipment",
    payment: "teacher_lesson_payment",
    student_lesson_feedback: "student_lesson_feedback",

    // From tables.ts (the new "hidden" entities)
    school_students: "school_student",
    referral: "referral",
    booking_student: "booking_student",
    equipment_event: "equipment_event",
    equipment_repair: "equipment_repair",
    rental: "rental",
    teacher_equipment: "teacher_equipment",
};

export async function getEntityCount(entityId: string): Promise<number> {
    try {
        const tableName = ENTITY_TABLE_MAP[entityId];

        if (!tableName) {
            logger.warn(`No table mapping found for entity: ${entityId}`);
            return 0;
        }

        const supabase = await getServerConnection();
        const { count, error } = await supabase
            .from(tableName)
            .select("*", { count: "exact", head: true });

        if (error) {
            handleSupabaseError(error, `fetch count for ${entityId}`);
            return 0;
        }

        return count || 0;
    } catch (error) {
        logger.error(`Error fetching count for entity ${entityId}`, error);
        return 0;
    }
}