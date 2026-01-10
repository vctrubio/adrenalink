import { SupabaseClient } from "@supabase/supabase-js";

export interface StudentEvent {
    event_id: string;
    event_date: string;
    event_duration: number;
    event_location: string;
    event_status: string;
    teacher_id: string;
    teacher_first_name: string;
    teacher_last_name: string;
    teacher_username: string;
    package_id: string;
    package_description: string;
    package_duration_minutes: number;
    package_price_per_student: number;
    package_category_equipment: string;
    package_capacity_equipment: number;
    package_capacity_students: number;
}

/**
 * Fetch all events for a student across all bookings
 */
export async function getStudentEventsRPC(supabase: SupabaseClient, studentId: string, schoolId?: string): Promise<StudentEvent[]> {
    const { data, error } = await supabase.rpc("get_student_events", {
        p_student_id: studentId,
        p_school_id: schoolId || null,
    });

    if (error) {
        throw new Error(`Failed to fetch student events: ${error.message}`);
    }

    return data || [];
}
