import { getServerConnection } from "@/supabase/connection";

export interface StudentBookingStatusResult {
  student_id: string;
  booking_count: number;
  duration_hours: number;
  total_event_count: number;
  total_event_duration: number;
  all_bookings_completed: boolean;
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
