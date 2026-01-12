"use server";

import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { convertUTCToSchoolTimezone, convertSchoolTimeToUTC } from "@/getters/timezone-getter";
import { createClassboardModel } from "@/getters/classboard-getter";
import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";
import type { ApiActionResponseModel } from "@/types/actions";
import { headers } from "next/headers";

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
        const headersList = await headers();
        let schoolId = headersList.get("x-school-id");
        let timezone = headersList.get("x-school-timezone");

        if (!schoolId) {
            const schoolHeader = await getSchoolHeader();
            if (!schoolHeader) {
                return {
                    success: false,
                    error: "School context could not be determined from header.",
                };
            }
            schoolId = schoolHeader.id;
            timezone = schoolHeader.timezone;
        } else if (!timezone) {
             const schoolHeader = await getSchoolHeader();
             if (schoolHeader) timezone = schoolHeader.timezone;
        }

        const supabase = getServerConnection();

        // Fetch all bookings with full nested relations
        const { data: bookingsResult, error } = await supabase
            .from("booking")
            .select(buildBookingQuery())
            .eq("school_id", schoolId)
            .order("date_start", { ascending: false });

        if (error) {
            console.error("[CLASSBOARD] Error fetching bookings:", error);
            return { success: false, error: "Failed to fetch classboard data" };
        }

        const classboardData = createClassboardModel(bookingsResult || []);

        // Convert all event times from UTC to school's local timezone for display
        if (timezone) {
            classboardData.forEach((bookingData) => {
                bookingData.lessons?.forEach((lessonData) => {
                    lessonData.events?.forEach((evt) => {
                        const convertedDate = convertUTCToSchoolTimezone(new Date(evt.date), timezone!);
                        evt.date = convertedDate.toISOString();
                    });
                });
            });
        }

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
        const headersList = await headers();
        let timezone = headersList.get("x-school-timezone");

        // Fallback if header missing
        if (!timezone) {
            const schoolHeader = await getSchoolHeader();
            if (schoolHeader) {
                timezone = schoolHeader.timezone;
            } else {
                 return {
                    success: false,
                    error: "School context could not be determined.",
                };
            }
        }

        const supabase = getServerConnection();

        // Fetch single booking with full nested relations
        const { data: bookingData, error } = await supabase.from("booking").select(buildBookingQuery()).eq("id", bookingId).single();

        if (error) {
            console.error("[CLASSBOARD] Error fetching booking:", error);
            return { success: false, error: "Failed to fetch booking data" };
        }

        if (!bookingData) {
            return { success: true, data: [] };
        }

        // createClassboardModel expects an array
        const classboardData = createClassboardModel([bookingData]);

        // Convert all event times from UTC to school's local timezone for display
        if (timezone) {
            classboardData.forEach((bd) => {
                bd.lessons?.forEach((lessonData) => {
                    lessonData.events?.forEach((evt) => {
                        const convertedDate = convertUTCToSchoolTimezone(new Date(evt.date), timezone!);
                        evt.date = convertedDate.toISOString();
                    });
                });
            });
        }

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
        // Get school context from header
        const headersList = await headers();
        const schoolId = headersList.get("x-school-id");
        const schoolZone = headersList.get("x-school-timezone");

        console.log("🔍 [createClassboardEvent] Headers Check:", {
            schoolId,
            schoolZone,
            allHeaders: Object.fromEntries(headersList.entries()),
        });

        if (!schoolId || !schoolZone) {
            return { success: false, error: "School context not found or timezone not configured" };
        }

        // Parse input: "2025-11-14T14:00:00"
        const dateMatch = eventDate.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):/);
        if (!dateMatch) {
            return { success: false, error: "Invalid event date format" };
        }

        const [, year, month, day, hours, minutes] = dateMatch;
        const dateStr = `${year}-${month}-${day}`;
        const timeStr = `${hours}:${minutes}:00`;

        // Calculate UTC time from school local time using robust getter
        // This handles DST and offset calculation correctly for the specific date
        const utcDate = convertSchoolTimeToUTC(`${dateStr}T${timeStr}`, schoolZone);

        // Store as UTC in database
        const supabase = getServerConnection();
        const { data: result, error } = await supabase
            .from("event")
            .insert({
                lesson_id: lessonId,
                school_id: schoolId,
                date: utcDate,
                duration,
                location,
                status: "planned",
            })
            .select()
            .single();

        if (error || !result) {
            console.error("❌ [classboard] DB Insert failed:", error);
            return { success: false, error: `Failed to create event: ${error?.message || "Unknown error"}` };
        }

        console.log("✅ [Event Created]", {
            schoolTime: timeStr,
            utcTime: utcDate.toISOString(),
            timezone: schoolZone,
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
        console.error("❌ [classboard] Error creating event:", error);
        return { success: false, error: `Failed to create event: ${error instanceof Error ? error.message : String(error)}` };
    }
}

/**
 * Delete event
 */
export async function deleteClassboardEvent(eventId: string): Promise<ApiActionResponseModel<{ success: boolean }>> {
    try {
        console.log(`🗑️ [classboard] Deleting event ${eventId}`);

        const supabase = getServerConnection();

        console.log(`🗑️ [classboard/deleteClassboardEvent] Checking if event exists: ${eventId}`);

        // Check if event exists
        const { data: eventToDelete, error: fetchError } = await supabase.from("event").select("id").eq("id", eventId).single();

        console.log("🗑️ [classboard/deleteClassboardEvent] Fetch result:", {
            eventToDelete,
            fetchError: fetchError ? { code: fetchError.code, message: fetchError.message, details: fetchError.details } : null
        });

        if (fetchError || !eventToDelete) {
            console.error(`🗑️ [classboard/deleteClassboardEvent] ❌ Event not found: ${eventId}`);
            return { success: false, error: `Event not found: ${eventId}` };
        }

        console.log("🗑️ [classboard/deleteClassboardEvent] Event exists, proceeding with delete...");

        // First delete related equipment_event records (cascade delete)
        console.log("🗑️ [classboard/deleteClassboardEvent] Deleting related equipment_event records...");
        const { error: equipmentDeleteError } = await supabase.from("equipment_event").delete().eq("event_id", eventId);

        if (equipmentDeleteError) {
            console.error("🗑️ [classboard/deleteClassboardEvent] ⚠️ Could not delete equipment_event records:", equipmentDeleteError);
            // Continue anyway - try to delete the event
        } else {
            console.log("✅ [classboard/deleteClassboardEvent] Related equipment_event records deleted");
        }

        // Now delete the event
        console.log("🗑️ [classboard/deleteClassboardEvent] Deleting event...");
        const { error: deleteError } = await supabase.from("event").delete().eq("id", eventId);

        console.log("🗑️ [classboard/deleteClassboardEvent] Delete result:", {
            deleteError: deleteError ? { code: deleteError.code, message: deleteError.message, details: deleteError.details } : null
        });

        if (deleteError) {
            console.error("🗑️ [classboard/deleteClassboardEvent] ❌ Delete failed:", deleteError);
            return { success: false, error: `Failed to delete event: ${deleteError.message}` };
        }

        console.log(`✅ [classboard/deleteClassboardEvent] Event deleted successfully: ${eventId}`);

        return { success: true, data: { success: true } };
    } catch (error) {
        console.error("❌ [classboard/deleteClassboardEvent] Exception:", error);
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
        console.log(`📍 [classboard] Updating event ${eventId} location to ${location}`);

        const supabase = getServerConnection();

        const { error } = await supabase.from("event").update({ location }).eq("id", eventId);

        if (error) {
            return { success: false, error: "Event not found" };
        }

        console.log(`✅ [classboard] Event location updated: ${eventId} -> ${location}`);

        return { success: true, data: { success: true } };
    } catch (error) {
        console.error("❌ [classboard] Error updating event location:", error);
        return { success: false, error: `Failed to update event location: ${error instanceof Error ? error.message : String(error)}` };
    }
}

/**
 * Update event start time
 */
export async function updateEventStartTime(eventId: string, newDate: string): Promise<ApiActionResponseModel<{ success: boolean }>> {
    try {
        console.log(`⏰ [classboard] Updating event ${eventId} start time to ${newDate}`);

        const supabase = getServerConnection();

        const { error } = await supabase
            .from("event")
            .update({ date: new Date(newDate) })
            .eq("id", eventId);

        if (error) {
            return { success: false, error: "Event not found" };
        }

        console.log(`✅ [classboard] Event start time updated: ${eventId} -> ${newDate}`);

        return { success: true, data: { success: true } };
    } catch (error) {
        console.error("❌ [classboard] Error updating event start time:", error);
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
        console.log(`📍 [classboard] Updating event ${eventId} status to ${status}`);

        const supabase = getServerConnection();

        const { error } = await supabase.from("event").update({ status }).eq("id", eventId);

        if (error) {
            return { success: false, error: "Event not found" };
        }

        console.log(`✅ [classboard] Event status updated: ${eventId} -> ${status}`);

        return { success: true, data: { success: true } };
    } catch (error) {
        console.error("❌ [classboard] Error updating event status:", error);
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
            console.log(`📝 [classboard] Updating ${updates.length} events with new dates, durations, and/or locations`);

            for (const update of updates) {
                const updateData: Record<string, any> = {};

                if (update.date !== undefined) {
                    updateData.date = new Date(update.date);
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

            console.log(`✅ [classboard] Updated ${updatedCount} events`);
        }

        // PRIORITY 2: Delete events after updating
        if (toDelete && toDelete.length > 0) {
            console.log(`🗑️ [classboard] Deleting ${toDelete.length} events after update`);

            const { error: deleteError } = await supabase.from("event").delete().in("id", toDelete);

            if (!deleteError) {
                deletedCount = toDelete.length;
            }
            console.log(`✅ [classboard] Deleted ${deletedCount} events`);
        }

        return {
            success: true,
            data: { updatedCount, deletedCount },
        };
    } catch (error) {
        console.error("❌ [classboard] Error in bulk operation:", error);
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

        console.log(`🗑️ [classboard/bulkDeleteClassboardEvents] Deleting ${eventIds.length} events`);

        const supabase = getServerConnection();

        // First delete related equipment_event records (cascade delete)
        console.log("🗑️ [classboard/bulkDeleteClassboardEvents] Deleting related equipment_event records...");
        const { error: equipmentDeleteError } = await supabase.from("equipment_event").delete().in("event_id", eventIds);

        if (equipmentDeleteError) {
            console.error("🗑️ [classboard/bulkDeleteClassboardEvents] ⚠️ Could not delete equipment_event records:", equipmentDeleteError);
            // Continue anyway
        } else {
            console.log("✅ [classboard/bulkDeleteClassboardEvents] Related equipment_event records deleted");
        }

        // Now delete the events
        console.log(`🗑️ [classboard/bulkDeleteClassboardEvents] Deleting ${eventIds.length} events...`);
        const { error } = await supabase.from("event").delete().in("id", eventIds);

        if (error) {
            console.error("🗑️ [classboard/bulkDeleteClassboardEvents] ❌ Delete failed:", error);
            return { success: false, error: `Failed to delete events: ${error.message}` };
        }

        console.log(`✅ [classboard/bulkDeleteClassboardEvents] Deleted ${eventIds.length} events`);

        return {
            success: true,
            data: { deletedCount: eventIds.length },
        };
    } catch (error) {
        console.error("❌ [classboard/bulkDeleteClassboardEvents] Exception:", error);
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
        const headersList = await headers();
        const schoolId = headersList.get("x-school-id");

        if (!schoolId) {
            return { success: false, error: "School not found" };
        }

        console.log(`🗑️ [classboard] Deleting all events for date: ${selectedDate}`);

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

        console.log(`✅ [classboard] Deleted events for date: ${selectedDate}`);

        return {
            success: true,
            data: { deletedCount: 0 }, // Supabase doesn't return count for deletes
        };
    } catch (error) {
        console.error("❌ [classboard] Error deleting all events:", error);
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

        console.log(`🗑️ [classboard] Deleting ${eventIds.length} uncompleted events`);

        const supabase = getServerConnection();

        const { error } = await supabase.from("event").delete().in("id", eventIds).neq("status", "completed");

        if (error) {
            return { success: false, error: "Failed to delete events" };
        }

        console.log("✅ [classboard] Deleted uncompleted events");

        return {
            success: true,
            data: { deletedCount: eventIds.length },
        };
    } catch (error) {
        console.error("❌ [classboard] Error deleting uncompleted events:", error);
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

        console.log(`📝 [classboard] Updating ${eventIds.length} events to status: ${status}`);

        const supabase = getServerConnection();

        const { error } = await supabase.from("event").update({ status }).in("id", eventIds);

        if (error) {
            return { success: false, error: "Failed to update status" };
        }

        console.log(`✅ [classboard] Updated ${eventIds.length} events to ${status}`);

        return {
            success: true,
            data: { updatedCount: eventIds.length },
        };
    } catch (error) {
        console.error("❌ [classboard] Error updating event status:", error);
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

        const SHIFT_DURATION_MINUTES = minutesToShift;

        console.log(
            `⏭️ [classboard] Cascading delete: shifting ${eventIds.length} events forward by ${SHIFT_DURATION_MINUTES} minutes`,
        );

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
            currentDate.setMinutes(currentDate.getMinutes() - SHIFT_DURATION_MINUTES);

            const { error: updateError } = await supabase.from("event").update({ date: currentDate }).eq("id", evt.id);

            if (!updateError) {
                shiftedCount++;
            }
        }

        console.log(
            `✅ [classboard] Cascade complete: shifted ${shiftedCount} events backward (${SHIFT_DURATION_MINUTES} min earlier)`,
        );

        return {
            success: true,
            data: { shiftedCount },
        };
    } catch (error) {
        console.error("❌ [classboard] Error cascading delete:", error);
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
        const headersList = await headers();
        const schoolId = headersList.get("x-school-id");

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
            console.error("❌ [classboard] Error fetching equipment:", error);
            return { success: false, error: "Failed to fetch equipment" };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error("❌ [classboard] Unexpected error fetching equipment:", error);
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
        console.log(`🔗 [classboard] Assigning equipment ${equipmentId} to event ${eventId}`);

        const supabase = getServerConnection();

        const { error } = await supabase.from("equipment_event").insert({ event_id: eventId, equipment_id: equipmentId });

        if (error) {
            console.error("❌ [classboard] Error assigning equipment:", error);
            return { success: false, error: "Failed to assign equipment" };
        }

        return { success: true, data: { success: true } };
    } catch (error) {
        console.error("❌ [classboard] Error in assignEquipmentToEvent:", error);
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
        console.log(`🔗 [classboard] Unassigning equipment ${equipmentId} from event ${eventId}`);

        const supabase = getServerConnection();

        const { error } = await supabase.from("equipment_event").delete().eq("event_id", eventId).eq("equipment_id", equipmentId);

        if (error) {
            console.error("❌ [classboard] Error unassigning equipment:", error);
            return { success: false, error: "Failed to unassign equipment" };
        }

        return { success: true, data: { success: true } };
    } catch (error) {
        console.error("❌ [classboard] Error in unassignEquipmentFromEvent:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}
