import { SupabaseClient } from "@supabase/supabase-js";

export interface TeacherEvent {
    event_id: string;
    event_date: string;
    event_duration: number;
    event_location: string;
    event_status: string;
    booking_id: string;
    leader_student_name: string;
    student_count: number;
    students_json: Array<{ id: string; firstName: string; lastName: string }>;
    package_id: string;
    package_description: string;
    package_duration_minutes: number;
    package_price_per_student: number;
    package_category_equipment: string;
    package_capacity_equipment: number;
    package_capacity_students: number;
    commission_id: string;
    commission_type: "fixed" | "percentage";
    commission_cph: string;
}

/**
 * Fetch all events for a teacher
 */
export async function getTeacherEventsRPC(supabase: SupabaseClient, teacherId: string, schoolId?: string): Promise<TeacherEvent[]> {
    const { data, error } = await supabase.rpc("get_teacher_events", {
        p_teacher_id: teacherId,
        p_school_id: schoolId || null,
    });

    if (error) {
        throw new Error(`Failed to fetch teacher events: ${error.message}`);
    }

    return data || [];
}
