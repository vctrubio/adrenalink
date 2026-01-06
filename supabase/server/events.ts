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
