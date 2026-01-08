"use server";

import { getServerConnection } from "@/supabase/connection";
import { headers } from "next/headers";
import type { ApiActionResponseModel } from "@/types/actions";
import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";

/**
 * Fetch classboard data with booking, lesson, and event information
 * New schema: bookings have direct school_package reference
 */
export async function getSQLClassboardData(): Promise<ApiActionResponseModel<ClassboardModel>> {
  try {
    const headersList = await headers();
    const schoolId = headersList.get("x-school-id");

    if (!schoolId) {
      return { success: false, error: "School ID not found in headers" };
    }

    const supabase = getServerConnection();

    // Fetch bookings with their students, packages, and lessons
    const { data: bookings, error: bookingError } = await supabase
      .from("booking")
      .select(`
        *,
        booking_student (
          student:student_id (
            id,
            first_name,
            last_name
          )
        ),
        school_package:school_package_id (
          id,
          duration_minutes,
          description,
          category_equipment
        ),
        lesson (
          id,
          teacher:teacher_id (
            id,
            username,
            first_name,
            last_name
          ),
          commission:commission_id (
            id,
            commission_type,
            cph
          ),
          event (
            id,
            date,
            duration,
            location,
            status
          )
        )
      `)
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false });

    if (bookingError) {
      console.error("Error fetching classboard data:", bookingError);
      return { success: false, error: "Failed to fetch classboard data" };
    }

    // Transform to ClassboardModel format
    const classboardData: ClassboardModel = {
      bookings: (bookings || []).map((booking: any) => ({
        id: booking.id,
        students: (booking.booking_student || []).map((bs: any) => ({
          id: bs.student.id,
          firstName: bs.student.first_name,
          lastName: bs.student.last_name,
        })),
        package: booking.school_package ? {
          id: booking.school_package.id,
          durationMinutes: booking.school_package.duration_minutes,
          description: booking.school_package.description,
          categoryEquipment: booking.school_package.category_equipment,
        } : null,
        lessons: (booking.lesson || []).map((lesson: any) => ({
          id: lesson.id,
          teacher: lesson.teacher ? {
            id: lesson.teacher.id,
            username: lesson.teacher.username,
            firstName: lesson.teacher.first_name,
            lastName: lesson.teacher.last_name,
          } : null,
          commission: lesson.commission ? {
            id: lesson.commission.id,
            type: lesson.commission.commission_type,
            value: lesson.commission.cph,
          } : null,
          events: (lesson.event || []).map((event: any) => ({
            id: event.id,
            date: event.date,
            duration: event.duration,
            location: event.location,
            status: event.status,
          })),
        })),
      })),
    };

    return { success: true, data: classboardData };
  } catch (error) {
    console.error("Error in getSQLClassboardData:", error);
    return { success: false, error: "Failed to fetch classboard data" };
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

    // Calculate UTC time from school local time
    const midnightUtc = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0));

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: schoolZone,
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
    const supabase = getServerConnection();
    const { data: result, error } = await supabase
      .from("event")
      .insert({
        lesson_id: lessonId,
        school_id: schoolId,
        date: new Date(`${dateStr}T${utcTimeStr}Z`),
        duration,
        location,
        status: "planned",
      })
      .select()
      .single();

    if (error || !result) {
      return { success: false, error: "Failed to create event" };
    }

    console.log("✅ [Event Created]", {
      schoolTime: timeStr,
      utcTime: utcTimeStr,
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
export async function deleteClassboardEvent(
  eventId: string,
): Promise<ApiActionResponseModel<{ success: boolean }>> {
  try {
    console.log(`🗑️ [classboard] Deleting event ${eventId}`);

    const supabase = getServerConnection();

    // Check if event exists
    const { data: eventToDelete, error: fetchError } = await supabase
      .from("event")
      .select("id")
      .eq("id", eventId)
      .single();

    if (fetchError || !eventToDelete) {
      return { success: false, error: "Event not found" };
    }

    // Delete the event
    const { error: deleteError } = await supabase
      .from("event")
      .delete()
      .eq("id", eventId);

    if (deleteError) {
      return { success: false, error: "Failed to delete event" };
    }

    console.log(`✅ [classboard] Event deleted: ${eventId}`);

    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("❌ [classboard] Error deleting event:", error);
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

    const { error } = await supabase
      .from("event")
      .update({ location })
      .eq("id", eventId);

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
export async function updateEventStartTime(
  eventId: string,
  newDate: string,
): Promise<ApiActionResponseModel<{ success: boolean }>> {
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
    return { success: false, error: `Failed to update event start time: ${error instanceof Error ? error.message : String(error)}` };
  }
}

/**
 * Update event status
 */
export async function updateEventStatus(
  eventId: string,
  status: string,
): Promise<ApiActionResponseModel<{ success: boolean }>> {
  try {
    console.log(`📍 [classboard] Updating event ${eventId} status to ${status}`);

    const supabase = getServerConnection();

    const { error } = await supabase
      .from("event")
      .update({ status })
      .eq("id", eventId);

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

      const { error: deleteError } = await supabase
        .from("event")
        .delete()
        .in("id", toDelete);

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
export async function bulkDeleteClassboardEvents(
  eventIds: string[],
): Promise<ApiActionResponseModel<{ deletedCount: number }>> {
  try {
    if (eventIds.length === 0) {
      return { success: false, error: "No events provided" };
    }

    console.log(`🗑️ [classboard] Deleting ${eventIds.length} events`);

    const supabase = getServerConnection();
    const { error } = await supabase.from("event").delete().in("id", eventIds);

    if (error) {
      return { success: false, error: "Failed to delete events" };
    }

    console.log(`✅ [classboard] Deleted ${eventIds.length} events`);

    return {
      success: true,
      data: { deletedCount: eventIds.length },
    };
  } catch (error) {
    console.error("❌ [classboard] Error deleting events:", error);
    return {
      success: false,
      error: `Failed to delete events: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Delete all events for selected date
 */
export async function deleteAllClassboardEvents(
  selectedDate: string,
): Promise<ApiActionResponseModel<{ deletedCount: number }>> {
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

    const { error } = await supabase
      .from("event")
      .delete()
      .in("id", eventIds)
      .neq("status", "completed");

    if (error) {
      return { success: false, error: "Failed to delete events" };
    }

    console.log(`✅ [classboard] Deleted uncompleted events`);

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

    console.log(`⏭️ [classboard] Cascading delete: shifting ${eventIds.length} events forward by ${SHIFT_DURATION_MINUTES} minutes`);

    const supabase = getServerConnection();

    // Fetch events to shift
    const { data: eventsToShift, error: fetchError } = await supabase
      .from("event")
      .select("id, date")
      .in("id", eventIds);

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

    console.log(`✅ [classboard] Cascade complete: shifted ${shiftedCount} events backward (${SHIFT_DURATION_MINUTES} min earlier)`);

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
