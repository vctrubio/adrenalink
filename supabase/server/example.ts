"use server";

import { getServerClient } from "@/supabase/server";

/**
 * Fetches a complete event with all nested relations using PostgREST
 * Includes lesson, teacher, booking, students, and equipment data
 */
export async function getExampleEventData(eventId: string) {
    try {
        const supabase = getServerClient();

        const { data, error } = await supabase
            .from("event")
            .select(`
                id,
                lesson_id,
                date,
                duration,
                location,
                status,
                lesson!inner(
                    id,
                    teacher_id,
                    status,
                    teacher!inner(
                        id,
                        first_name,
                        last_name,
                        username,
                        school_id,
                        school!inner(
                            id,
                            name,
                            username
                        )
                    ),
                    teacher_commission!inner(
                        id,
                        cph,
                        commission_type,
                        description
                    ),
                    booking!inner(
                        id,
                        date_start,
                        date_end,
                        student_package_id,
                        student_package!inner(
                            id,
                            school_package_id,
                            school_package!inner(
                                id,
                                duration_minutes,
                                description,
                                price_per_student
                            )
                        ),
                        booking_student!inner(
                            id,
                            student_id,
                            student!inner(
                                id,
                                first_name,
                                last_name,
                                passport,
                                country,
                                phone,
                                languages
                            )
                        )
                    )
                ),
                equipment_event!inner(
                    id,
                    equipment_id,
                    equipment!inner(
                        id,
                        name,
                        status,
                        condition
                    )
                )
            `)
            .eq("id", eventId)
            .single();

        if (error) {
            console.error("[EXAMPLE] Error fetching event:", error);
            return { success: false, error: "Event not found" };
        }

        if (!data) {
            return { success: false, error: "Event not found" };
        }

        // Ensure clean serialization
        const cleanData = JSON.parse(JSON.stringify(data));

        return { success: true, data: cleanData };
    } catch (error) {
        console.error("[EXAMPLE] Error fetching example event data:", error);
        return { success: false, error: "Failed to fetch data" };
    }
}
