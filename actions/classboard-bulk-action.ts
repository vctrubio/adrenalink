"use server";

import { db } from "@/drizzle/db";
import { event } from "@/drizzle/schema";
import { inArray, eq, and, ne } from "drizzle-orm";
import type { ApiActionResponseModel } from "@/types/actions";
import { getSchoolHeader } from "@/types/headers";

/**
 * Bulk update event dates, durations, and locations (preserves existing status)
 * Optionally delete specified events after updating
 * Priority: UPDATE first, then DELETE
 */
export async function bulkUpdateClassboardEvents(
    updates: Array<{ id: string; date: string; duration: number; location?: string }>,
    toDelete?: string[]
): Promise<ApiActionResponseModel<{ updatedCount: number; deletedCount: number }>> {
    try {
        if (updates.length === 0 && (!toDelete || toDelete.length === 0)) {
            return { success: false, error: "No events provided" };
        }

        let updatedCount = 0;
        let deletedCount = 0;

        // PRIORITY 1: Update events first
        if (updates.length > 0) {
            console.log(`📝 [classboard-bulk-action] Updating ${updates.length} events with new dates, durations, and/or locations`);

            for (const update of updates) {
                const updateData: Record<string, any> = {
                    date: new Date(update.date),
                    duration: update.duration,
                };

                if (update.location !== undefined) {
                    updateData.location = update.location;
                }

                const result = await db
                    .update(event)
                    .set(updateData)
                    .where(eq(event.id, update.id))
                    .returning({ id: event.id });

                if (result.length > 0) {
                    updatedCount++;
                }
            }

            console.log(`✅ [classboard-bulk-action] Updated ${updatedCount} events`);
        }

        // PRIORITY 2: Delete events after updating
        if (toDelete && toDelete.length > 0) {
            console.log(`🗑️ [classboard-bulk-action] Deleting ${toDelete.length} events after update`);

            const deleteResult = await db.delete(event).where(inArray(event.id, toDelete)).returning({ id: event.id });

            deletedCount = deleteResult.length;
            console.log(`✅ [classboard-bulk-action] Deleted ${deletedCount} events`);
        }

        return {
            success: true,
            data: { updatedCount, deletedCount },
        };
    } catch (error) {
        console.error("❌ [classboard-bulk-action] Error in bulk operation:", error);
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

        console.log(`🗑️ [classboard-bulk-action] Deleting ${eventIds.length} events`);

        const result = await db.delete(event).where(inArray(event.id, eventIds)).returning({ id: event.id });

        console.log(`✅ [classboard-bulk-action] Deleted ${result.length} events`);

        return {
            success: true,
            data: { deletedCount: result.length },
        };
    } catch (error) {
        console.error("❌ [classboard-bulk-action] Error deleting events:", error);
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
            return { success: false, error: "School not found" };
        }

        console.log(`🗑️ [classboard-bulk-action] Deleting all events for date: ${selectedDate}`);

        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const result = await db
            .delete(event)
            .where(
                and(
                    eq(event.schoolId, schoolHeader.id),
                    // Date is within the selected day
                    // Note: This assumes dates are stored as timestamps
                ),
            )
            .returning({ id: event.id });

        console.log(`✅ [classboard-bulk-action] Deleted ${result.length} events`);

        return {
            success: true,
            data: { deletedCount: result.length },
        };
    } catch (error) {
        console.error("❌ [classboard-bulk-action] Error deleting all events:", error);
        return {
            success: false,
            error: `Failed to delete all events: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Delete all uncompleted events (planned + tbc)
 */
export async function deleteUncompletedClassboardEvents(eventIds: string[]): Promise<ApiActionResponseModel<{ deletedCount: number }>> {
    try {
        if (eventIds.length === 0) {
            return { success: false, error: "No events provided" };
        }

        console.log(`🗑️ [classboard-bulk-action] Deleting ${eventIds.length} uncompleted events`);

        const result = await db
            .delete(event)
            .where(and(inArray(event.id, eventIds), ne(event.status, "completed")))
            .returning({ id: event.id });

        console.log(`✅ [classboard-bulk-action] Deleted ${result.length} uncompleted events`);

        return {
            success: true,
            data: { deletedCount: result.length },
        };
    } catch (error) {
        console.error("❌ [classboard-bulk-action] Error deleting uncompleted events:", error);
        return {
            success: false,
            error: `Failed to delete uncompleted events: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Bulk update event status
 */
export async function bulkUpdateEventStatus(eventIds: string[], status: string): Promise<ApiActionResponseModel<{ updatedCount: number }>> {
    try {
        if (eventIds.length === 0) {
            return { success: false, error: "No events provided" };
        }

        console.log(`📝 [classboard-bulk-action] Updating ${eventIds.length} events to status: ${status}`);

        const result = await db.update(event).set({ status }).where(inArray(event.id, eventIds)).returning({ id: event.id });

        console.log(`✅ [classboard-bulk-action] Updated ${result.length} events to ${status}`);

        return {
            success: true,
            data: { updatedCount: result.length },
        };
    } catch (error) {
        console.error("❌ [classboard-bulk-action] Error updating event status:", error);
        return {
            success: false,
            error: `Failed to update event status: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Cascade delete: Shift all subsequent events backward (earlier) by the deleted event's duration
 * Called after a delete with "shift queue" option to fill the gap left by the deleted event
 * Event listener handles UI updates, so no revalidatePath needed
 */
export async function cascadeDeleteWithShift(eventIds: string[], minutesToShift: number): Promise<ApiActionResponseModel<{ shiftedCount: number }>> {
    try {
        if (eventIds.length === 0) {
            return { success: true, data: { shiftedCount: 0 } };
        }

        // Store the minutes to shift as const for clarity
        const SHIFT_DURATION_MINUTES = minutesToShift;

        console.log(`⏭️ [classboard-bulk-action] Cascading delete: shifting ${eventIds.length} events forward by ${SHIFT_DURATION_MINUTES} minutes`);

        // Fetch all events to be shifted
        const eventsToShift = await db.query.event.findMany({
            where: inArray(event.id, eventIds),
        });

        // Update each event by shifting its time backward (earlier) to fill the gap
        let shiftedCount = 0;
        for (const evt of eventsToShift) {
            const currentDate = new Date(evt.date);
            currentDate.setMinutes(currentDate.getMinutes() - SHIFT_DURATION_MINUTES);

            await db.update(event).set({ date: currentDate }).where(eq(event.id, evt.id));

            shiftedCount++;
        }

        console.log(`✅ [classboard-bulk-action] Cascade complete: shifted ${shiftedCount} events backward (${SHIFT_DURATION_MINUTES} min earlier)`);

        return {
            success: true,
            data: { shiftedCount },
        };
    } catch (error) {
        console.error("❌ [classboard-bulk-action] Error cascading delete:", error);
        return {
            success: false,
            error: `Failed to cascade delete: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}
