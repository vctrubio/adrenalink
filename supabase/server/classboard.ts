"use server";

import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { createClassboardModel } from "@/getters/classboard-getter";
import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";
import type { ApiActionResponseModel } from "@/types/actions";
import { revalidatePath } from "next/cache";
import { logger } from "@/backend/logger";
import { safeArray } from "@/backend/error-handlers";

/**
 * Shared query builder for booking relations
 * Updated for NEW SCHEMA: direct link from booking to school_package
 */
function buildBookingQuery() {
    return `
        id,
        date_start,
        date_end,
        school_id,
        leader_student_name,
        school_package_id,
        school_package!inner(
            id,
            duration_minutes,
            description,
            price_per_student,
            capacity_students,
            capacity_equipment,
            category_equipment
        ),
        booking_student(
            student_id,
            student(
                id,
                first_name,
                last_name,
                passport,
                country,
                phone,
                languages
            )
        ),
        lesson(
            id,
            teacher_id,
            status,
            teacher(
                id,
                first_name,
                last_name,
                username
            ),
            teacher_commission(
                id,
                cph,
                commission_type,
                description
            ),
            event(
                id,
                lesson_id,
                date,
                duration,
                location,
                status,
                equipment_event(
                    equipment(
                        id,
                        brand,
                        model,
                        size,
                        sku,
                        color
                    )
                )
            )
        )
    `;
}

/**
 * Fetches all classboard bookings for a school
 * Used for initial page load to populate the entire classboard
 */
export async function getSQLClassboardData(): Promise<ApiActionResponseModel<ClassboardModel>> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return {
                success: false,
                error: "School context could not be determined from header.",
            };
        }
        const schoolId = schoolHeader.id;

        const supabase = getServerConnection();

        // Fetch all bookings with full nested relations
        const { data: bookingsResult, error } = await supabase
            .from("booking")
            .select(buildBookingQuery())
            .eq("school_id", schoolId)
            .order("date_start", { ascending: false });

        if (error) {
            logger.error("Error fetching bookings", error);
            return { success: false, error: "Failed to fetch classboard data" };
        }

        const classboardData = createClassboardModel(safeArray(bookingsResult));

        return { success: true, data: classboardData };
    } catch (error) {
        return {
            success: false,
            error: `Failed to fetch classboard data: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Fetches a single booking with all its relations
 * Used for realtime sync updates
 */
export async function getSQLClassboardDataForBooking(bookingId: string): Promise<ApiActionResponseModel<ClassboardModel>> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return {
                success: false,
                error: "School context could not be determined.",
            };
        }

        const supabase = getServerConnection();

        // Fetch single booking with full nested relations
        const { data: bookingData, error } = await supabase.from("booking").select(buildBookingQuery()).eq("id", bookingId).single();

        if (error) {
            logger.error("Error fetching booking", error);
            return { success: false, error: "Failed to fetch booking data" };
        }

        if (!bookingData) {
            return { success: true, data: [] };
        }

        // createClassboardModel expects an array
        const classboardData = createClassboardModel([bookingData]);

        return { success: true, data: classboardData };
    } catch (error) {
        return {
            success: false,
            error: `Failed to fetch booking data: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Create event with timezone conversion
 */
export async function createClassboardEvent(
    lessonId: string,
    eventDate: string,
    duration: number,
    location: string,
): Promise<
    ApiActionResponseModel<{
        id: string;
        date: string;
        duration: number;
        location: string;
        status: string;
    }>
> {
    try {
        // Get school header
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }
        const schoolId = schoolHeader.id;

        // Parse input: "2025-11-14T14:00:00"
        const dateMatch = eventDate.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):/);
        if (!dateMatch) {
            return { success: false, error: "Invalid event date format" };
        }

        const [, year, month, day, hours, minutes] = dateMatch;
        const dateStr = `${year}-${month}-${day}`;
        const timeStr = `${hours}:${minutes}:00`;

        // Store as Wall Clock Time (e.g. "2024-01-01T10:00:00") directly in the DB
        const eventDateISO = `${dateStr}T${timeStr}`;

        // Store as TIMESTAMP in database (Postgres will treat this as abstract timestamp)
        const supabase = getServerConnection();
        const { data: result, error } = await supabase
            .from("event")
            .insert({
                lesson_id: lessonId,
                school_id: schoolId,
                date: eventDateISO,
                duration,
                location,
                status: "planned",
            })
            .select()
            .single();

        if (error || !result) {
            logger.error("DB Insert failed", error);
            return { success: false, error: `Failed to create event: ${error?.message || "Unknown error"}` };
        }

        logger.info("Event created", {
            schoolTime: timeStr,
            dbTime: eventDateISO,
        });

        return {
            success: true,
            data: {
                id: result.id,
                date: new Date(result.date).toISOString(),
                duration: result.duration,
                location: result.location,
                status: result.status,
            },
        };
    } catch (error) {
        logger.error("Error creating event", error);
        return { success: false, error: `Failed to create event: ${error instanceof Error ? error.message : String(error)}` };
    }
}

/**
 * Delete event
 */
export async function deleteClassboardEvent(eventId: string): Promise<ApiActionResponseModel<{ success: boolean }>> {
    try {
        const supabase = getServerConnection();

        // Check if event exists
        const { data: eventToDelete, error: fetchError } = await supabase.from("event").select("id").eq("id", eventId).single();

        if (fetchError || !eventToDelete) {
            logger.error("Event not found", fetchError, { eventId });
            return { success: false, error: `Event not found: ${eventId}` };
        }

        // First delete related equipment_event records (cascade delete)
        const { error: equipmentDeleteError } = await supabase.from("equipment_event").delete().eq("event_id", eventId);

        if (equipmentDeleteError) {
            logger.warn("Could not delete equipment_event records", { eventId });
        }

        // Now delete the event
        const { error: deleteError } = await supabase.from("event").delete().eq("id", eventId);

        if (deleteError) {
            logger.error("Failed to delete event", deleteError, { eventId });
            return { success: false, error: `Failed to delete event: ${deleteError.message}` };
        }

        logger.info("Event deleted successfully", { eventId });
        return { success: true, data: { success: true } };
    } catch (error) {
        logger.error("Exception deleting event", error);
        return { success: false, error: `Failed to delete event: ${error instanceof Error ? error.message : String(error)}` };
    }
}

/**
 * Update event location
 */
export async function updateClassboardEventLocation(
    eventId: string,
    location: string,
): Promise<ApiActionResponseModel<{ success: boolean }>> {
    try {
        logger.debug("Updating event location", { eventId, location });

        const supabase = getServerConnection();

        const { error } = await supabase.from("event").update({ location }).eq("id", eventId);

        if (error) {
            return { success: false, error: "Event not found" };
        }

        logger.info("Event location updated", { eventId, location });

        return { success: true, data: { success: true } };
    } catch (error) {
        logger.error("Error updating event location", error);
        return { success: false, error: `Failed to update event location: ${error instanceof Error ? error.message : String(error)}` };
    }
}

/**
 * Update event start time
 */
export async function updateEventStartTime(eventId: string, newDate: string): Promise<ApiActionResponseModel<{ success: boolean }>> {
    try {
        logger.debug("Updating event start time", { eventId, newDate });

        const supabase = getServerConnection();

        const { error } = await supabase
            .from("event")
            .update({ date: newDate })
            .eq("id", eventId);

        if (error) {
            return { success: false, error: "Event not found" };
        }

        logger.info("Event start time updated", { eventId, newDate });

        return { success: true, data: { success: true } };
    } catch (error) {
        logger.error("Error updating event start time", error);
        return {
            success: false,
            error: `Failed to update event start time: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Update event status
 */
export async function updateEventStatus(eventId: string, status: string): Promise<ApiActionResponseModel<{ success: boolean }>> {
    try {
        logger.debug("Updating event status", { eventId, status });

        const supabase = getServerConnection();

        const { error } = await supabase.from("event").update({ status }).eq("id", eventId);

        if (error) {
            return { success: false, error: "Event not found" };
        }

        logger.info("Event status updated", { eventId, status });

        // Revalidate teachers path - Next.js will automatically revalidate /teachers/[id] routes
        revalidatePath("/teachers");

        return { success: true, data: { success: true } };
    } catch (error) {
        logger.error("Error updating event status", error);
        return { success: false, error: `Failed to update event status: ${error instanceof Error ? error.message : String(error)}` };
    }
}

/**
 * Bulk update events: dates, durations, and locations
 */
export async function bulkUpdateClassboardEvents(
    updates: { id: string; date: string; duration: number; location?: string }[],
    toDelete?: string[],
): Promise<ApiActionResponseModel<{ updatedCount: number; deletedCount: number }>> {
    try {
        if (updates.length === 0 && (!toDelete || toDelete.length === 0)) {
            return { success: false, error: "No events provided" };
        }

        let updatedCount = 0;
        let deletedCount = 0;

        const supabase = getServerConnection();

        // PRIORITY 1: Update events first
        if (updates.length > 0) {
            logger.debug("Updating events", { count: updates.length });

            for (const update of updates) {
                const updateData: Record<string, any> = {};

                if (update.date !== undefined) {
                    // Use string directly to preserve Wall Clock Time
                    updateData.date = update.date;
                }
                if (update.duration !== undefined) {
                    updateData.duration = update.duration;
                }
                if (update.location !== undefined) {
                    updateData.location = update.location;
                }

                if (Object.keys(updateData).length === 0) {
                    continue;
                }

                const { error } = await supabase.from("event").update(updateData).eq("id", update.id);

                if (!error) {
                    updatedCount++;
                }
            }

            logger.info("Events updated", { updatedCount });
        }

        // PRIORITY 2: Delete events after updating
        if (toDelete && toDelete.length > 0) {
            logger.debug("Deleting events after update", { count: toDelete.length });

            const { error: deleteError } = await supabase.from("event").delete().in("id", toDelete);

            if (!deleteError) {
                deletedCount = toDelete.length;
            }
            logger.info("Events deleted", { deletedCount });
        }

        return {
            success: true,
            data: { updatedCount, deletedCount },
        };
    } catch (error) {
        logger.error("Error in bulk operation", error);
        return {
            success: false,
            error: `Failed to process events: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Bulk delete events
 */
export async function bulkDeleteClassboardEvents(eventIds: string[]): Promise<ApiActionResponseModel<{ deletedCount: number }>> {
    try {
        if (eventIds.length === 0) {
            return { success: false, error: "No events provided" };
        }

        logger.debug("Deleting events", { count: eventIds.length });

        const supabase = getServerConnection();

        // First delete related equipment_event records (cascade delete)
        logger.debug("Deleting related equipment_event records");
        const { error: equipmentDeleteError } = await supabase.from("equipment_event").delete().in("event_id", eventIds);

        if (equipmentDeleteError) {
            logger.warn("Could not delete equipment_event records", { error: equipmentDeleteError });
            // Continue anyway
        } else {
            logger.debug("Related equipment_event records deleted");
        }

        // Now delete the events
        logger.debug("Deleting events", { count: eventIds.length });
        const { error } = await supabase.from("event").delete().in("id", eventIds);

        if (error) {
            logger.error("Delete failed", error);
            return { success: false, error: `Failed to delete events: ${error.message}` };
        }

        logger.info("Events deleted", { count: eventIds.length });

        return {
            success: true,
            data: { deletedCount: eventIds.length },
        };
    } catch (error) {
        logger.error("Exception deleting events", error);
        return {
            success: false,
            error: `Failed to delete events: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Delete all events for selected date
 */
export async function deleteAllClassboardEvents(selectedDate: string): Promise<ApiActionResponseModel<{ deletedCount: number }>> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }
        const schoolId = schoolHeader.id;

        if (!schoolId) {
            return { success: false, error: "School not found" };
        }

        logger.debug("Deleting all events for date", { selectedDate });

        const supabase = getServerConnection();

        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const { error: deleteError } = await supabase
            .from("event")
            .delete()
            .eq("school_id", schoolId)
            .gte("date", startOfDay.toISOString())
            .lte("date", endOfDay.toISOString());

        if (deleteError) {
            return { success: false, error: "Failed to delete events" };
        }

        logger.info("Deleted events for date", { selectedDate });

        return {
            success: true,
            data: { deletedCount: 0 }, // Supabase doesn't return count for deletes
        };
    } catch (error) {
        logger.error("Error deleting all events", error);
        return {
            success: false,
            error: `Failed to delete all events: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Delete all uncompleted events
 */
export async function deleteUncompletedClassboardEvents(
    eventIds: string[],
): Promise<ApiActionResponseModel<{ deletedCount: number }>> {
    try {
        if (eventIds.length === 0) {
            return { success: false, error: "No events provided" };
        }

        logger.debug("Deleting uncompleted events", { count: eventIds.length });

        const supabase = getServerConnection();

        const { error } = await supabase.from("event").delete().in("id", eventIds).neq("status", "completed");

        if (error) {
            return { success: false, error: "Failed to delete events" };
        }

        logger.info("Deleted uncompleted events", { count: eventIds.length });

        return {
            success: true,
            data: { deletedCount: eventIds.length },
        };
    } catch (error) {
        logger.error("Error deleting uncompleted events", error);
        return {
            success: false,
            error: `Failed to delete uncompleted events: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Bulk update event status
 */
export async function bulkUpdateEventStatus(
    eventIds: string[],
    status: string,
): Promise<ApiActionResponseModel<{ updatedCount: number }>> {
    try {
        if (eventIds.length === 0) {
            return { success: false, error: "No events provided" };
        }

        logger.debug("Updating event status", { count: eventIds.length, status });

        const supabase = getServerConnection();

        const { error } = await supabase.from("event").update({ status }).in("id", eventIds);

        if (error) {
            return { success: false, error: "Failed to update status" };
        }

        logger.info("Events updated to status", { count: eventIds.length, status });

        return {
            success: true,
            data: { updatedCount: eventIds.length },
        };
    } catch (error) {
        logger.error("Error updating event status", error);
        return {
            success: false,
            error: `Failed to update event status: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Cascade delete with shift: Shift all subsequent events backward (earlier)
 */
export async function cascadeDeleteWithShift(
    eventIds: string[],
    minutesToShift: number,
): Promise<ApiActionResponseModel<{ shiftedCount: number }>> {
    try {
        if (eventIds.length === 0) {
            return { success: true, data: { shiftedCount: 0 } };
        }

        logger.debug("Cascading delete: shifting events", { count: eventIds.length, minutesToShift });

        const supabase = getServerConnection();

        // Fetch events to shift
        const { data: eventsToShift, error: fetchError } = await supabase.from("event").select("id, date").in("id", eventIds);

        if (fetchError || !eventsToShift) {
            return { success: false, error: "Failed to fetch events" };
        }

        // Update each event by shifting its time backward
        let shiftedCount = 0;
        for (const evt of eventsToShift) {
            const currentDate = new Date(evt.date);
            currentDate.setMinutes(currentDate.getMinutes() - minutesToShift);

            const { error: updateError } = await supabase.from("event").update({ date: currentDate }).eq("id", evt.id);

            if (!updateError) {
                shiftedCount++;
            }
        }

        logger.info("Cascade complete: events shifted", { shiftedCount, minutesToShift });

        return {
            success: true,
            data: { shiftedCount },
        };
    } catch (error) {
        logger.error("Error cascading delete", error);
        return {
            success: false,
            error: `Failed to cascade delete: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Fetch available equipment for a category
 */
export async function getAvailableEquipment(category: string): Promise<ApiActionResponseModel<any[]>> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }
        const schoolId = schoolHeader.id;

        if (!schoolId) {
            return { success: false, error: "School context not found" };
        }

        const supabase = getServerConnection();

        const { data, error } = await supabase
            .from("equipment")
            .select(
                `
                  id, brand, model, size, color, status, sku,
                  teacher_equipment(teacher_id)
                `,
            )
            .eq("school_id", schoolId)
            .eq("category", category)
            .in("status", ["rental", "public"])
            .order("brand", { ascending: true });
        if (error) {
            logger.error("Error fetching equipment", error);
            return { success: false, error: "Failed to fetch equipment" };
        }

        return { success: true, data: safeArray(data) };
    } catch (error) {
        logger.error("Unexpected error fetching equipment", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Assign equipment to an event
 */
export async function assignEquipmentToEvent(
    eventId: string,
    equipmentId: string,
): Promise<ApiActionResponseModel<{ success: boolean }>> {
    try {
        logger.debug("Assigning equipment to event", { eventId, equipmentId });

        const supabase = getServerConnection();

        const { error } = await supabase.from("equipment_event").insert({ event_id: eventId, equipment_id: equipmentId });

        if (error) {
            logger.error("Error assigning equipment", error);
            return { success: false, error: "Failed to assign equipment" };
        }

        // Revalidate teachers path - Next.js will automatically revalidate /teachers/[id] routes
        revalidatePath("/teachers");

        return { success: true, data: { success: true } };
    } catch (error) {
        logger.error("Error assigning equipment to event", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Unassign equipment from an event
 */
export async function unassignEquipmentFromEvent(
    eventId: string,
    equipmentId: string,
): Promise<ApiActionResponseModel<{ success: boolean }>> {
    try {
        logger.debug("Unassigning equipment from event", { eventId, equipmentId });

        const supabase = getServerConnection();

        const { error } = await supabase.from("equipment_event").delete().eq("event_id", eventId).eq("equipment_id", equipmentId);

        if (error) {
            logger.error("Error unassigning equipment", error);
            return { success: false, error: "Failed to unassign equipment" };
        }

        // Revalidate teachers path - Next.js will automatically revalidate /teachers/[id] routes
        revalidatePath("/teachers");

        return { success: true, data: { success: true } };
    } catch (error) {
        logger.error("Error unassigning equipment from event", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}
