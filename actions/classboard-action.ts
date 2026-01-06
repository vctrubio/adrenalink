"use server";

/**
 * NOTE: getClassboardBookings() has been replaced by getSQLClassboardData() in @/supabase/server/classboard.ts
 * The new implementation uses Drizzle's query builder for type safety.
 * This file now only contains event mutation functions (create, update, delete).
 */

import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { event } from "@/drizzle/schema";
import { getSchoolHeader } from "@/types/headers";
import { getSQLClassboardData } from "@/supabase/server/classboard-old-schema";
import type { ApiActionResponseModel } from "@/types/actions";
import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";

// Re-export for backwards compatibility
export async function getClassboardBookings(): Promise<ApiActionResponseModel<ClassboardModel>> {
    return getSQLClassboardData();
}

export async function createClassboardEvent(lessonId: string, eventDate: string, duration: number, location: string): Promise<ApiActionResponseModel<{ id: string; date: string; duration: number; location: string; status: string }>> {
    try {
        // Get school context from header (returns {id, name, zone})
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found or timezone not configured." };
        }

        // Parse input: "2025-11-14T14:00:00"
        const dateMatch = eventDate.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):/);
        if (!dateMatch) {
            return { success: false, error: "Invalid event date format" };
        }

        const [, year, month, day, hours, minutes] = dateMatch;
        const dateStr = `${year}-${month}-${day}`;
        const timeStr = `${hours}:${minutes}:00`;

        // Calculate UTC time from school local time
        // Input is school's local time, need to convert to UTC for storage
        const midnightUtc = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0));

        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: schoolHeader.zone, // Use 'zone' for the timezone
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        const displayedTime = formatter.format(midnightUtc);
        const [displayHours, displayMinutes] = displayedTime.split(":").map(Number);

        // Calculate offset: how many minutes ahead is the school's midnight vs UTC midnight
        const offsetTotalMinutes = displayHours * 60 + displayMinutes;

        // Convert school time to UTC by subtracting the offset
        const schoolTotalMinutes = parseInt(hours) * 60 + parseInt(minutes);
        const utcTotalMinutes = schoolTotalMinutes - offsetTotalMinutes;

        const utcHours = Math.floor(utcTotalMinutes / 60) % 24;
        const utcMins = utcTotalMinutes % 60;
        const utcTimeStr = `${String(utcHours).padStart(2, "0")}:${String(utcMins).padStart(2, "0")}:00`;

        // Store as UTC in database
        const result = await db
            .insert(event)
            .values({
                lessonId,
                schoolId: schoolHeader.id, // Use 'id' for the school ID
                date: new Date(`${dateStr}T${utcTimeStr}Z`), // Store as UTC
                duration,
                location,
                status: "planned",
            })
            .returning();

        if (!result || result.length === 0) {
            return { success: false, error: "Failed to create event" };
        }

        console.log("✅ [Event Created]", {
            schoolTime: timeStr,
            utcTime: utcTimeStr,
            timezone: schoolHeader.zone,
        });

        return {
            success: true,
            data: {
                id: result[0].id,
                date: result[0].date.toISOString(),
                duration: result[0].duration,
                location: result[0].location,
                status: result[0].status,
            },
        };
    } catch (error) {
        console.error("❌ [classboard-action] Error creating event:", error);
        return { success: false, error: `Failed to create event: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function deleteClassboardEvent(eventId: string): Promise<ApiActionResponseModel<{ success: boolean }>> {
    try {
        console.log(`🗑️ [classboard-action] Deleting event ${eventId}`);

        // Find the event to verify it exists
        const eventToDelete = await db.query.event.findFirst({
            where: eq(event.id, eventId),
            columns: {
                id: true,
            },
        });

        if (!eventToDelete) {
            return { success: false, error: "Event not found" };
        }

        // Delete the event
        await db.delete(event).where(eq(event.id, eventId));

        console.log(`✅ [classboard-action] Event deleted: ${eventId}`);

        // No revalidatePath needed - real-time listener handles updates

        return { success: true, data: { success: true } };
    } catch (error) {
        console.error("❌ [classboard-action] Error deleting event:", error);
        return { success: false, error: `Failed to delete event: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function updateClassboardEventLocation(eventId: string, location: string): Promise<ApiActionResponseModel<{ success: boolean }>> {
    try {
        console.log(`📍 [classboard-action] Updating event ${eventId} location to ${location}`);

        const result = await db.update(event).set({ location }).where(eq(event.id, eventId)).returning();

        if (!result || result.length === 0) {
            return { success: false, error: "Event not found" };
        }

        console.log(`✅ [classboard-action] Event location updated: ${eventId} -> ${location}`);

        return { success: true, data: { success: true } };
    } catch (error) {
        console.error("❌ [classboard-action] Error updating event location:", error);
        return { success: false, error: `Failed to update event location: ${error instanceof Error ? error.message : String(error)}` };
    }
}

/**
 * Update event start time (used by EventCard for immediate gap corrections)
 */
export async function updateEventStartTime(eventId: string, newDate: string): Promise<ApiActionResponseModel<{ success: boolean }>> {
    try {
        console.log(`⏰ [classboard-action] Updating event ${eventId} start time to ${newDate}`);

        const result = await db
            .update(event)
            .set({ date: new Date(newDate) })
            .where(eq(event.id, eventId))
            .returning();

        if (!result || result.length === 0) {
            return { success: false, error: "Event not found" };
        }

        console.log(`✅ [classboard-action] Event start time updated: ${eventId} -> ${newDate}`);

        return { success: true, data: { success: true } };
    } catch (error) {
        console.error("❌ [classboard-action] Error updating event start time:", error);
        return { success: false, error: `Failed to update event start time: ${error instanceof Error ? error.message : String(error)}` };
    }
}

/**
 * Update event status
 */
export async function updateEventStatus(eventId: string, status: string): Promise<ApiActionResponseModel<{ success: boolean }>> {
    try {
        console.log(`📍 [classboard-action] Updating event ${eventId} status to ${status}`);

        const result = await db.update(event).set({ status }).where(eq(event.id, eventId)).returning();

        if (!result || result.length === 0) {
            return { success: false, error: "Event not found" };
        }

        console.log(`✅ [classboard-action] Event status updated: ${eventId} -> ${status}`);

        return { success: true, data: { success: true } };
    } catch (error) {
        console.error("❌ [classboard-action] Error updating event status:", error);
        return { success: false, error: `Failed to update event status: ${error instanceof Error ? error.message : String(error)}` };
    }
}
