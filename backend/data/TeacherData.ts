import type { TeacherWithLessonsAndPayments, TeacherTableStats } from "@/config/tables";
import type { Teacher } from "@/supabase/db/types";

/**
 * Teacher Relations - all related data from joined tables
 */
export interface TeacherRelations {
    teacher_commission: any[];
    lesson: any[];
    teacher_equipment: any[];
}

/**
 * Teacher Update Form - fields that can be updated
 */
export type TeacherUpdateForm = Omit<Teacher, "id" | "school_id" | "created_at" | "updated_at">;

/**
 * Teacher Data - complete teacher record with schema, form, and relations
 */
export interface TeacherData {
    schema: Teacher;
    updateForm: TeacherUpdateForm;
    relations: TeacherRelations;
}

/**
 * Calculate stats for a single teacher record
 */
export function calculateTeacherStats(teacher: TeacherWithLessonsAndPayments): TeacherTableStats {
    const totalLessons = teacher.lessons.length;
    const totalDurationMinutes = teacher.lessons.reduce((sum, l) => sum + l.events.totalDuration, 0);
    const totalCommissions = teacher.lessons.reduce((sum, l) => {
        const { commission, events, lessonRevenue } = l;
        const duration = events.totalDuration / 60;
        const cph = parseFloat(commission.cph || "0");

        if (commission.type === "fixed") {
            return sum + cph * duration;
        } else if (commission.type === "percentage") {
            return sum + lessonRevenue * (cph / 100);
        }
        return sum;
    }, 0);
    const totalPayments = teacher.lessons.reduce((sum, l) => sum + l.teacherPayments, 0);

    return {
        teacherCount: 1,
        totalLessons,
        totalDurationMinutes,
        totalCommissions,
        totalPayments,
    };
}
