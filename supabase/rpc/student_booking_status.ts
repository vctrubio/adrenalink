import { getServerConnection } from "@/supabase/connection";

export interface StudentBookingStatusResult {
    student_id: string;
    first_name: string;
    last_name: string;
    passport: string;
    country: string;
    phone: string;
    languages: string[];
    school_student_id: string;
    description: string | null;
    active: boolean;
    rental: boolean;
    booking_count: number;
    total_event_count: number;
    total_event_duration: number;
    all_bookings_completed: boolean;
    created_at: string;
}

export async function getStudentBookingStatus(schoolId: string) {
    const supabase = getServerConnection();

    const { data, error } = await supabase.rpc("get_student_booking_status", {
        p_school_id: schoolId,
    });

    if (error) {
        console.error("Error fetching student booking status:", error);
        return [];
    }

    return (data || []) as StudentBookingStatusResult[];
}
