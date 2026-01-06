/**
 * @file This file implements a unified pattern for retrieving contextual data from request headers.
 *
 * The core concept is the `getXHeader` function pattern, where `X` is an entity
 * like `School`, `Teacher`, or `Student`. Each function returns a standardized object
 * with the shape `{ id, name, zone }` to provide a consistent way of accessing
 * context across the application.
 *
 * The meaning of the `name` and `zone` fields is specific to the entity being requested.
 * This file provides `getSchoolHeader` as the first implementation of this pattern.
 *
 * @pattern getXHeader() -> { id: string, name: string, zone: string }
 */

import { unstable_cache, revalidateTag } from "next/cache";
import { cache } from "react";
import { headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { getServerConnection } from "@/supabase/connection";

/**
 * The standardized return object for header context functions.
 * @property {string} id - The unique identifier (UUID) of the entity.
 * @property {string} name - A name or identifier for the entity. Its meaning depends on the entity type.
 * @property {string} zone - A zone or scope for the entity. Its meaning depends on the entity type.
 */
export interface HeaderContext {
    id: string;
    name: string;
    zone: string;
}

/**
 * Internal cached function to look up the full school object by username.
 * This is the single source of truth for fetching school data from the database.
 */
const getSchoolByUsername = unstable_cache(
    async (username: string): Promise<any | null> => {
        try {
            const supabase = getServerConnection();
            const { data, error } = await supabase
                .from("school")
                .select("*")
                .eq("username", username)
                .single();
            
            if (error) throw error;
            return data || null;
        } catch (error) {
            unstable_rethrow(error);
            // CRITICAL: We THROW here so unstable_cache does NOT cache the failure.
            // Returning null would cache the "not found" state for 1 hour.
            console.error(`💥 [getSchoolByUsername] DB Error for "${username}":`, error);
            throw error; 
        }
    },
    ["school-by-username"],
    {
        revalidate: 3600, // Cache for 1 hour
        tags: ["school"],
    },
);

/**
 * Retrieves school context from the 'x-school-username' header.
 * 
 * Uses React's cache() for request-level memoization:
 * - First call: Does DB lookup
 * - Subsequent calls in same request: Returns cached value (no DB hit)
 *
 * This function follows the `getXHeader` pattern, returning a standardized
 * `HeaderContext` object for the school.
 *
 * @returns {Promise<HeaderContext | null>} A promise that resolves to a `HeaderContext` object for the school, or `null` if the header is not found.
 */
export const getSchoolHeader = cache(async (): Promise<HeaderContext | null> => {
    const headersList = await headers();
    const username = headersList.get("x-school-username");

    if (!username) {
        return null;
    }

    let schoolData: any | null = null;

    try {
        schoolData = await getSchoolByUsername(username);
    } catch (error) {
        unstable_rethrow(error);
        console.error("⚠️ [getSchoolHeader] Cache fetch failed, attempting direct DB fallback...");
    }

    // If cached value is null or missing timezone, bypass cache and fetch directly
    if (!schoolData || !schoolData.timezone) {
        try {
            const supabase = getServerConnection();
            const { data, error } = await supabase
                .from("school")
                .select("*")
                .eq("username", username)
                .single();
            
            if (error) throw error;
            schoolData = data;
        } catch (error) {
            unstable_rethrow(error);
            console.error(`❌ [getSchoolHeader] Direct DB fallback failed for "${username}":`, error);
            return null;
        }
    }

    if (!schoolData || !schoolData.timezone) {
        if (!schoolData) {
            console.warn(`[getSchoolHeader] School "${username}" not found after both cache and DB checks.`);
        } else {
            console.warn(`[getSchoolHeader] School "${username}" is missing a timezone. Configure timezone in school settings.`);
        }
        return null;
    }

    return {
        id: schoolData.id,
        name: schoolData.username,
        zone: schoolData.timezone,
    };
});

/**
 * Revalidates the 'school' cache tag.
 *
 * Call this function after any operation that updates a school's data
 * to ensure that subsequent calls to `getSchoolHeader` fetch fresh data.
 */
export function revalidateSchoolCache(): void {
    // @ts-expect-error - Next.js 16 types mismatch for revalidateTag
    revalidateTag("school");
    console.log("DEV:DEBUG ✅ Revalidated 'school' cache tag.");
}

/**
 * Gets the user role from the 'x-user-role' header.
 *
 * @returns {Promise<string | null>} The user role (e.g., "student", "teacher") or `null` if the header is not set.
 */
export async function getUserRole(): Promise<string | null> {
    const headersList = await headers();
    return headersList.get("x-user-role");
}