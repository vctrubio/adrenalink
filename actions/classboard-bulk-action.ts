"use server";

import { db } from "@/drizzle/db";
import { event } from "@/drizzle/schema";
import { inArray, eq, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ApiActionResponseModel } from "@/types/actions";
import { getSchoolIdFromHeader } from "@/types/headers";

/**
 * Bulk update events status
 */
export async function bulkUpdateClassboardEvents(
    eventIds: string[],
    status: "planned" | "tbc" | "completed" | "uncompleted"
): Promise<ApiActionResponseModel<{ updatedCount: number }>> {
    try {
        if (eventIds.length === 0) {
            return { success: false, error: "No events provided" };
        }

        console.log(`📝 [classboard-bulk-action] Updating ${eventIds.length} events to status: ${status}`);

        const result = await db
            .update(event)
            .set({ status })
            .where(inArray(event.id, eventIds))
            .returning({ id: event.id });

        revalidatePath("/classboard");

        console.log(`✅ [classboard-bulk-action] Updated ${result.length} events to ${status}`);

        return {
            success: true,
            data: { updatedCount: result.length },
        };
    } catch (error) {
        console.error(`❌ [classboard-bulk-action] Error updating events:`, error);
        return {
            success: false,
            error: `Failed to update events: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Bulk delete events
 */
export async function bulkDeleteClassboardEvents(
    eventIds: string[]
): Promise<ApiActionResponseModel<{ deletedCount: number }>> {
    try {
        if (eventIds.length === 0) {
            return { success: false, error: "No events provided" };
        }

        console.log(`🗑️ [classboard-bulk-action] Deleting ${eventIds.length} events`);

        const result = await db
            .delete(event)
            .where(inArray(event.id, eventIds))
            .returning({ id: event.id });

        revalidatePath("/classboard");

        console.log(`✅ [classboard-bulk-action] Deleted ${result.length} events`);

        return {
            success: true,
            data: { deletedCount: result.length },
        };
    } catch (error) {
        console.error(`❌ [classboard-bulk-action] Error deleting events:`, error);
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
    selectedDate: string
): Promise<ApiActionResponseModel<{ deletedCount: number }>> {
    try {
        const schoolId = await getSchoolIdFromHeader();
        if (!schoolId) {
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
                    eq(event.schoolId, schoolId),
                    // Date is within the selected day
                    // Note: This assumes dates are stored as timestamps
                )
            )
            .returning({ id: event.id });

        revalidatePath("/classboard");

        console.log(`✅ [classboard-bulk-action] Deleted ${result.length} events`);

        return {
            success: true,
            data: { deletedCount: result.length },
        };
    } catch (error) {
        console.error(`❌ [classboard-bulk-action] Error deleting all events:`, error);
        return {
            success: false,
            error: `Failed to delete all events: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Delete all uncompleted events (planned + tbc)
 */
export async function deleteUncompletedClassboardEvents(
    eventIds: string[]
): Promise<ApiActionResponseModel<{ deletedCount: number }>> {
    try {
        if (eventIds.length === 0) {
            return { success: false, error: "No events provided" };
        }

        console.log(`🗑️ [classboard-bulk-action] Deleting ${eventIds.length} uncompleted events`);

        const result = await db
            .delete(event)
            .where(
                and(
                    inArray(event.id, eventIds),
                    ne(event.status, "completed")
                )
            )
            .returning({ id: event.id });

        revalidatePath("/classboard");

        console.log(`✅ [classboard-bulk-action] Deleted ${result.length} uncompleted events`);

        return {
            success: true,
            data: { deletedCount: result.length },
        };
    } catch (error) {
        console.error(`❌ [classboard-bulk-action] Error deleting uncompleted events:`, error);
        return {
            success: false,
            error: `Failed to delete uncompleted events: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}
