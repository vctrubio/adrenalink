/**
 * Generic CRUD Operation Helpers
 *
 * Replaces 3+ duplicated CRUD patterns in register.ts, commissions.ts, lessons.ts.
 * Single source of truth for create, update, delete operations.
 *
 * Usage:
 *   const result = await createItem("students", studentData, "/admin/students");
 */

import { revalidatePath } from "next/cache";
import type { ApiActionResponseModel } from "@/types/actions";
import { getServerConnection } from "@/supabase/connection";
import { handleSupabaseError, isUniqueConstraintError } from "./error-handlers";
import { logger } from "./logger";
import { getSchoolId } from "./school-context";

/**
 * Generic create operation
 *
 * Handles:
 * - Insert data into table
 * - Add school_id automatically
 * - Error handling (including unique constraint)
 * - Cache revalidation
 * - Logging
 *
 * Usage:
 *   const result = await createItem(
 *     "students",
 *     { first_name: "John", ... },
 *     "/admin/students"
 *   );
 *   if (!result.success) return result;
 */
export async function createItem<T>(
    table: string,
    data: Record<string, any>,
    revalidatePaths: string | string[] = [],
    options?: {
        context?: string;
        userMessage?: string;
        skipSchoolId?: boolean;
    }
): Promise<ApiActionResponseModel<T>> {
    try {
        const schoolId = await getSchoolId();
        if (!schoolId && !options?.skipSchoolId) {
            return {
                success: false,
                error: "School context not found",
            };
        }

        const supabase = getServerConnection();
        const insertData = {
            ...data,
            ...(schoolId && !options?.skipSchoolId && { school_id: schoolId }),
        };

        logger.debug(`Creating item in ${table}`, { table, keys: Object.keys(insertData) });

        const { data: result, error } = await supabase
            .from(table)
            .insert(insertData)
            .select()
            .single();

        if (error) {
            if (isUniqueConstraintError(error)) {
                logger.warn(`Unique constraint violation when creating ${table}`, {
                    table,
                    error: error.message,
                });
                return {
                    success: false,
                    error: options?.userMessage || "Item already exists",
                };
            }
            return handleSupabaseError(
                error,
                `create item in ${table}`,
                options?.userMessage
            );
        }

        logger.info(`Created item in ${table}`, { table, id: result?.id });

        // Revalidate paths
        const paths = Array.isArray(revalidatePaths)
            ? revalidatePaths
            : [revalidatePaths];
        for (const path of paths) {
            if (path) revalidatePath(path);
        }

        return {
            success: true,
            data: result as T,
        };
    } catch (error) {
        logger.error(`Unexpected error creating ${table}`, error, {
            table,
        });
        return {
            success: false,
            error: options?.userMessage || "Failed to create item",
        };
    }
}

/**
 * Generic update operation
 *
 * Handles:
 * - Update data in table
 * - Filter by id and school_id
 * - Error handling
 * - Cache revalidation
 * - Logging
 *
 * Usage:
 *   const result = await updateItem(
 *     "students",
 *     studentId,
 *     { first_name: "Jane" },
 *     "/admin/students"
 *   );
 */
export async function updateItem<T>(
    table: string,
    id: string,
    data: Record<string, any>,
    revalidatePaths: string | string[] = [],
    options?: {
        context?: string;
        userMessage?: string;
        skipSchoolId?: boolean;
    }
): Promise<ApiActionResponseModel<T>> {
    try {
        const schoolId = await getSchoolId();
        if (!schoolId && !options?.skipSchoolId) {
            return {
                success: false,
                error: "School context not found",
            };
        }

        const supabase = getServerConnection();

        logger.debug(`Updating item in ${table}`, {
            table,
            id,
            keys: Object.keys(data),
        });

        let query = supabase.from(table).update(data).eq("id", id);

        if (schoolId && !options?.skipSchoolId) {
            query = query.eq("school_id", schoolId);
        }

        const { data: result, error } = await query.select().single();

        if (error) {
            return handleSupabaseError(
                error,
                `update item in ${table}`,
                options?.userMessage
            );
        }

        logger.info(`Updated item in ${table}`, { table, id });

        // Revalidate paths
        const paths = Array.isArray(revalidatePaths)
            ? revalidatePaths
            : [revalidatePaths];
        for (const path of paths) {
            if (path) revalidatePath(path);
        }

        return {
            success: true,
            data: result as T,
        };
    } catch (error) {
        logger.error(`Unexpected error updating ${table}`, error, {
            table,
            id,
        });
        return {
            success: false,
            error: options?.userMessage || "Failed to update item",
        };
    }
}

/**
 * Generic delete operation
 *
 * Handles:
 * - Delete data from table
 * - Filter by id and school_id
 * - Error handling
 * - Cache revalidation
 * - Logging
 *
 * Usage:
 *   const result = await deleteItem("students", studentId, "/admin/students");
 */
export async function deleteItem(
    table: string,
    id: string,
    revalidatePaths: string | string[] = [],
    options?: {
        context?: string;
        userMessage?: string;
        skipSchoolId?: boolean;
    }
): Promise<ApiActionResponseModel<void>> {
    try {
        const schoolId = await getSchoolId();
        if (!schoolId && !options?.skipSchoolId) {
            return {
                success: false,
                error: "School context not found",
            };
        }

        const supabase = getServerConnection();

        logger.debug(`Deleting item from ${table}`, { table, id });

        let query = supabase.from(table).delete().eq("id", id);

        if (schoolId && !options?.skipSchoolId) {
            query = query.eq("school_id", schoolId);
        }

        const { error } = await query;

        if (error) {
            return handleSupabaseError(
                error,
                `delete item from ${table}`,
                options?.userMessage
            );
        }

        logger.info(`Deleted item from ${table}`, { table, id });

        // Revalidate paths
        const paths = Array.isArray(revalidatePaths)
            ? revalidatePaths
            : [revalidatePaths];
        for (const path of paths) {
            if (path) revalidatePath(path);
        }

        return {
            success: true,
            data: undefined,
        };
    } catch (error) {
        logger.error(`Unexpected error deleting ${table}`, error, {
            table,
            id,
        });
        return {
            success: false,
            error: options?.userMessage || "Failed to delete item",
        };
    }
}

/**
 * Examples of replacing duplicate code:
 *
 * ===== BEFORE (register.ts - 58 lines) =====
 *
 * export async function createSchool(schoolData) {
 *     try {
 *         const supabase = getServerConnection();
 *         const { data: result, error } = await supabase
 *             .from("school")
 *             .insert(schoolData)
 *             .select()
 *             .single();
 *
 *         if (error) {
 *             console.error("Error creating school:", error);
 *             return { success: false, error: "Failed to create school" };
 *         }
 *
 *         revalidatePath("/discover");
 *         return { success: true, data: result };
 *     } catch (error) {
 *         console.error("Error in createSchool:", error);
 *         return { success: false, error: "Failed to create school" };
 *     }
 * }
 *
 * ===== AFTER (One-liner) =====
 *
 * export async function createSchool(schoolData) {
 *     return createItem("school", schoolData, "/discover");
 * }
 *
 * ===== EXTRA FEATURES =====
 *
 * // With custom user message
 * return createItem("school", schoolData, "/discover", {
 *     userMessage: "This school name already exists"
 * });
 *
 * // With multiple revalidate paths
 * return createItem("students", data, ["/admin/students", "/admin/dashboard"]);
 *
 * // Skip school_id (for system tables)
 * return createItem("payment_log", data, "/admin", { skipSchoolId: true });
 */
