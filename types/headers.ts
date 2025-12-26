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

import { headers } from "next/headers";
import { unstable_cache, revalidateTag } from "next/cache";
import { db } from "@/drizzle/db";
import { school } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

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
 * It is cached for 1 hour and tagged for on-demand revalidation.
 */
const getSchoolByUsername = unstable_cache(
    async (username: string): Promise<typeof school.$inferSelect | null> => {
        try {
            const result = await db.query.school.findFirst({
                where: eq(school.username, username),
            });
            return result || null;
        } catch (error) {
            console.error(`Error fetching school by username "${username}":`, error);
            return null;
        }
    },
    ["school-by-username"], // Cache key for this specific lookup
    {
        revalidate: 3600, // Cache for 1 hour
        tags: ["school"], // Tag for on-demand revalidation
    },
);

/**
 * Retrieves school context from the 'x-school-username' header.
 *
 * This function follows the `getXHeader` pattern, returning a standardized
 * `HeaderContext` object for the school.
 *
 * @returns {Promise<HeaderContext | null>} A promise that resolves to a `HeaderContext` object for the school, or `null` if the header is not found or the school does not exist.
 *
 * @example
 * // For a school with username 'kite-tarifa', id '...', and timezone 'Europe/Madrid':
 * const schoolCtx = await getSchoolHeader();
 * if (schoolCtx) {
 *   console.log(schoolCtx.id);   // '...' (The school's UUID)
 *   console.log(schoolCtx.name); // 'kite-tarifa' (The school's username)
 *   console.log(schoolCtx.zone); // 'Europe/Madrid' (The school's timezone)
 * }
 *
 * @mapping
 * - `id`: The school's unique UUID (`school.id`).
 * - `name`: The school's `username` slug (`school.username`).
 * - `zone`: The school's IANA timezone string (`school.timezone`).
 */
export async function getSchoolHeader(): Promise<HeaderContext | null> {
    const headersList = await headers();
    const username = headersList.get("x-school-username");

    console.log("getSchoolHeader: x-school-username header value::::::::::::::::::::", username);
    if (!username) {
        return null;
    }

    let schoolData = await getSchoolByUsername(username);

    console.log("getSchoolHeader: schoolData fetched from cache::::::::::::::::::::", schoolData);

    // If cached value is null or missing timezone, bypass cache and fetch directly
    if (!schoolData || !schoolData.timezone) {
        console.log("getSchoolHeader: Cached value null or missing timezone, fetching directly from DB...");

        try {
            schoolData = await db.query.school.findFirst({
                where: eq(school.username, username),
            });
            console.log("getSchoolHeader: Fresh data from DB::::::::::::::::::::", schoolData);
        } catch (error) {
            console.error(`Error fetching school by username "${username}" from DB:`, error);
            return null;
        }
    }

    // schoolData?.timezone = "America/New_York"; // DEV OVERRIDE

    if (!schoolData || !schoolData.timezone) {
        if (!schoolData) {
            console.warn(`[getSchoolHeader] School with username "${username}" not found in database.`);
        } else {
            console.warn(`[getSchoolHeader] School "${username}" is missing a timezone.`);
        }
        return null;
    }

    return {
        id: schoolData.id,
        name: schoolData.username,
        zone: schoolData.timezone,
    };
}

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
