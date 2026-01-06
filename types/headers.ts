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

import { revalidateTag } from "next/cache";
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

    try {
        const supabase = getServerConnection();
        const { data: schoolData, error } = await supabase
            .from("school")
            .select("*")
            .eq("username", username)
            .single();
        
        if (error) {
            console.error(`❌ [getSchoolHeader] DB lookup failed for "${username}":`, error);
            unstable_rethrow(error);
            return null;
        }

        if (!schoolData || !schoolData.timezone) {
            console.warn(`[getSchoolHeader] School "${username}" is missing required data (id, timezone).`);
            return null;
        }

        return {
            id: schoolData.id,
            name: schoolData.username,
            zone: schoolData.timezone,
        };
    } catch (error) {
        unstable_rethrow(error);
        console.error(`💥 [getSchoolHeader] Critical error for "${username}":`, error);
        return null;
    }
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

