"use server";

/**
 * Event Server Actions
 * 
 * All server-side operations related to events are defined here.
 * This includes updating event status, fetching event data, and other event mutations.
 * 
 * These are used by client components (like EventHomeStatusLabel) for optimistic updates
 * and real-time synchronization with the database.
 */

import { getServerConnection } from "@/supabase/connection";
import type { EventStatus } from "@/types/status";
import { getSchoolHeader } from "@/types/headers";
import { convertUTCToSchoolTimezone } from "@/getters/timezone-getter";

interface UpdateEventStatusResult {
    success: boolean;
    error?: string;
    data?: {
        id: string;
        status: EventStatus;
    };
}

/**
 * Update an event's status
 * Called from client-side components with optimistic updates
 */
export async function updateEventIdStatus(eventId: string, newStatus: EventStatus): Promise<UpdateEventStatusResult> {
    try {
        const supabase = getServerConnection();

        const { data, error } = await supabase
            .from("event")
            .update({ status: newStatus })
            .eq("id", eventId)
            .select("id, status")
            .single();

        if (error) {
            console.error("Error updating event status:", error);
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data: {
                id: data.id,
                status: data.status as EventStatus,
            },
        };
    } catch (error) {
        console.error("Unexpected error updating event status:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update event status",
        };
    }
}

/**
 * Fetches a complete event transaction with all nested relations
 * Used for the /transaction page to show full details
 */
export async function getEventTransaction(eventId: string) {
    try {
        const supabase = getServerConnection();
        const schoolHeader = await getSchoolHeader();

        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

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
                        status,
                        school_package!inner(
                            id,
                            duration_minutes,
                            description,
                            price_per_student,
                            category_equipment,
                            capacity_equipment,
                            capacity_students,
                            package_type
                        ),
                        booking_student!inner(
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
            `)
            .eq("id", eventId)
            .single();

        if (error) {
            console.error("[EVENT] Error fetching event transaction:", JSON.stringify(error, null, 2));
            return { success: false, error: "Event not found" };
        }

        if (!data) {
            return { success: false, error: "Event not found" };
        }

        // Ensure clean serialization
        const cleanData = JSON.parse(JSON.stringify(data));

        // Convert UTC to school timezone
        const convertedDate = convertUTCToSchoolTimezone(new Date(cleanData.date), schoolHeader.zone);
        cleanData.date = convertedDate.toISOString();

        return { success: true, data: cleanData };
    } catch (error) {
        console.error("[EVENT] Error fetching event transaction:", error);
        return { success: false, error: "Failed to fetch data" };
    }
}
