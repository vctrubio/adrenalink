/**
 * Error Handling Utilities
 *
 * Replaces 142+ scattered error handling patterns throughout codebase.
 * Single source of truth for error classification and response formatting.
 *
 * Usage:
 *   const { data, error } = await supabase.from("student").select("*");
 *   if (error) {
 *     return handleSupabaseError(error, "fetch student data");
 *   }
 */

import type { ApiActionResponseModel } from "@/types/actions";
import { logger } from "./logger";

/**
 * Supabase error codes
 */
export enum SupabaseErrorCode {
    UNIQUE_CONSTRAINT = "23505",
    NOT_FOUND = "PGRST116",
    UNAUTHORIZED = "PGRST301",
    INVALID_JWT = "401",
    FOREIGN_KEY = "23503",
}

/**
 * Check if error is unique constraint violation
 */
export function isUniqueConstraintError(error: any): boolean {
    if (!error) return false;
    return (
        error.code === SupabaseErrorCode.UNIQUE_CONSTRAINT ||
        error.message?.includes("unique constraint") ||
        error.message?.includes("duplicate key")
    );
}

/**
 * Check if error is foreign key constraint violation
 */
export function isForeignKeyError(error: any): boolean {
    if (!error) return false;
    return (
        error.code === SupabaseErrorCode.FOREIGN_KEY ||
        error.message?.includes("foreign key constraint")
    );
}

/**
 * Check if error is not found
 */
export function isNotFoundError(error: any): boolean {
    if (!error) return false;
    return (
        error.code === SupabaseErrorCode.NOT_FOUND ||
        error.status === 404 ||
        error.message?.includes("No rows found")
    );
}

/**
 * Check if error is unauthorized
 */
export function isUnauthorizedError(error: any): boolean {
    if (!error) return false;
    return (
        error.code === SupabaseErrorCode.UNAUTHORIZED ||
        error.code === SupabaseErrorCode.INVALID_JWT ||
        error.status === 401 ||
        error.message?.includes("Unauthorized")
    );
}

/**
 * Handle Supabase errors with appropriate response
 *
 * Maps database errors to user-friendly messages
 */
export function handleSupabaseError(
    error: any,
    context: string,
    userMessage?: string
): ApiActionResponseModel<never> {
    logger.error(`Database error: ${context}`, error);

    if (isUniqueConstraintError(error)) {
        return {
            success: false,
            error: userMessage || "This item already exists",
        };
    }

    if (isForeignKeyError(error)) {
        return {
            success: false,
            error: userMessage || "Referenced item does not exist",
        };
    }

    if (isNotFoundError(error)) {
        return {
            success: false,
            error: userMessage || "Item not found",
        };
    }

    if (isUnauthorizedError(error)) {
        return {
            success: false,
            error: "Unauthorized access",
        };
    }

    return {
        success: false,
        error: userMessage || "An error occurred",
    };
}

/**
 * Wrap async operation with error handling
 *
 * Usage:
 *   const result = await withErrorHandling(
 *     () => supabase.from("table").select("*"),
 *     "fetch data"
 *   );
 */
export async function withErrorHandling<T>(
    fn: () => Promise<T>,
    context: string,
    userMessage?: string
): Promise<ApiActionResponseModel<T>> {
    try {
        const data = await fn();
        return { success: true, data };
    } catch (error) {
        return handleSupabaseError(error, context, userMessage);
    }
}

/**
 * Safe array access with error handling
 */
export function safeArray<T>(arr: T[] | null | undefined): T[] {
    return arr || [];
}

/**
 * Ensure value exists or throw
 */
export function assertExists<T>(
    value: T | null | undefined,
    message: string
): T {
    if (value === null || value === undefined) {
        logger.error(message);
        throw new Error(message);
    }
    return value;
}

/**
 * Examples:
 *
 * BEFORE:
 * const { data, error } = await supabase.from("student").select("*");
 * if (error) {
 *     console.error("Error fetching student:", error);
 *     return { success: false, error: "Failed to fetch student" };
 * }
 *
 * AFTER:
 * const { data, error } = await supabase.from("student").select("*");
 * if (error) {
 *     return handleSupabaseError(error, "fetch student data");
 * }
 *
 * ---
 *
 * BEFORE:
 * try {
 *     const result = await supabase.from("table").insert(data).select();
 *     if (result.error) {
 *         console.error("Insert error:", result.error);
 *         return { success: false, error: "Failed" };
 *     }
 *     return { success: true, data: result.data };
 * } catch (error) {
 *     console.error("Unexpected error:", error);
 *     return { success: false, error: "Failed" };
 * }
 *
 * AFTER:
 * const result = await withErrorHandling(
 *     () => supabase.from("table").insert(data).select(),
 *     "insert data"
 * );
 * if (!result.success) return result;
 * return { success: true, data: result.data };
 *
 * ---
 *
 * BEFORE:
 * if (error?.code === "23505" || error?.message?.includes("unique constraint")) {
 *     return { success: false, error: "Item already exists" };
 * }
 *
 * AFTER:
 * if (isUniqueConstraintError(error)) {
 *     return { success: false, error: "Item already exists" };
 * }
 *
 * ---
 *
 * BEFORE:
 * const items = (data.items || []).map(...)
 *
 * AFTER:
 * const items = safeArray(data.items).map(...)
 */
