import { headers } from "next/headers";
import { unstable_cache, revalidateTag } from "next/cache";
import { db } from "@/drizzle/db";
import { school } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Gets the x-school-username header value
 * @returns The school username from headers, or null if not present
 */
export async function getHeaderUsername(): Promise<string | null> {
    const headersList = await headers();
    const username = headersList.get("x-school-username");
    console.log("DEV:DEBUG 📋 getHeaderUsername() called, result:", username);
    return username;
}

/**
 * Internal cached function to lookup school ID by username
 * Cached for 1 hour with tag for revalidation
 */
const getSchoolIdByUsername = unstable_cache(
    async (username: string): Promise<string | null> => {
        try {
            const result = await db.query.school.findFirst({
                where: eq(school.username, username),
                columns: {
                    id: true,
                },
            });

            return result?.id || null;
        } catch (error) {
            console.error("Error fetching school ID:", error);
            return null;
        }
    },
    ["school-id-by-username"],
    {
        revalidate: 3600, // Cache for 1 hour
        tags: ["school"],
    }
);

/**
 * Gets the school ID based on the x-school-username header
 * This is the primary helper for all actions that need school context
 * 
 * PERFORMANCE: Uses Next.js unstable_cache to cache username → ID lookup
 * - Cached for 1 hour
 * - Tagged with "school" for targeted revalidation
 * - Significantly reduces database queries
 * 
 * @returns The school ID (UUID), or null if not found or header not present
 */
export async function getSchoolIdFromHeader(): Promise<string | null> {
    const username = await getHeaderUsername();

    if (!username) {
        return null;
    }

    return getSchoolIdByUsername(username);
}

/**
 * Internal cached function to lookup full school by username
 * Cached for 1 hour with tag for revalidation
 */
const getSchoolByUsername = unstable_cache(
    async (username: string): Promise<typeof school.$inferSelect | null> => {
        try {
            console.log("DEV:DEBUG 🔍 getSchoolByUsername() querying for:", username);
            const result = await db.query.school.findFirst({
                where: eq(school.username, username),
            });

            console.log("DEV:DEBUG 🔍 getSchoolByUsername() result:", result ? "FOUND" : "NOT FOUND");
            if (result) {
                console.log("DEV:DEBUG   - School ID:", result.id);
                console.log("DEV:DEBUG   - School name:", result.name);
                console.log("DEV:DEBUG   - School username:", result.username);
            }

            return result || null;
        } catch (error) {
            console.error("Error fetching school:", error);
            return null;
        }
    },
    ["school-by-username"],
    {
        revalidate: 3600, // Cache for 1 hour
        tags: ["school"],
    }
);

/**
 * Gets full school data based on the x-school-username header
 * Use this when you need multiple school fields (id, name, etc.)
 * 
 * PERFORMANCE: Uses Next.js unstable_cache to cache username → school lookup
 * - Cached for 1 hour
 * - Tagged with "school" for targeted revalidation
 * 
 * @returns The school record, or null if not found or header not present
 */
export async function getSchoolFromHeader(): Promise<typeof school.$inferSelect | null> {
    const username = await getHeaderUsername();

    if (!username) {
        return null;
    }

    return getSchoolByUsername(username);
}

/**
 * Gets the school name based on the x-school-username header
 * @returns The school name, or null if not found or header not present
 */
export async function getSchoolName(): Promise<string | null> {
    const username = await getHeaderUsername();

    if (!username) {
        return null;
    }

    try {
        const result = await db.query.school.findFirst({
            where: eq(school.username, username),
            columns: {
                name: true,
            },
        });

        return result?.name || null;
    } catch (error) {
        console.error("Error fetching school name:", error);
        return null;
    }
}

/**
 * Internal cached function to lookup school timezone by username
 * Reads timezone directly from school record
 * Cached for 1 hour with tag for revalidation
 */
const getSchoolTimezoneByUsername = unstable_cache(
    async (username: string): Promise<string | null> => {
        try {
            const result = await db.query.school.findFirst({
                where: eq(school.username, username),
                columns: {
                    timezone: true,
                },
            });

            if (!result || !result.timezone) {
                console.warn(`School ${username} missing timezone field`);
                return null;
            }

            return result.timezone;
        } catch (error) {
            console.error("Error fetching school timezone:", error);
            return null;
        }
    },
    ["school-timezone-by-username"],
    {
        revalidate: 3600, // Cache for 1 hour
        tags: ["school"],
    }
);

/**
 * Gets the school's IANA timezone based on latitude/longitude
 * Example return values: "America/New_York", "Europe/London", "Asia/Tokyo"
 *
 * PERFORMANCE: Uses Next.js unstable_cache to cache timezone lookup
 * - Cached for 1 hour
 * - Tagged with "school" for targeted revalidation
 *
 * @returns The IANA timezone string, or null if not found or header not present
 */
export async function getSchoolTimezoneFromHeader(): Promise<string | null> {
    const username = await getHeaderUsername();

    if (!username) {
        return null;
    }

    return getSchoolTimezoneByUsername(username);
}

/**
 * Revalidate school cache
 * Call this after updating school data (name, username, latitude, longitude, etc.)
 * This will clear the cached username → ID and timezone lookups
 *
 * Usage:
 * ```typescript
 * await updateSchool(schoolId, { latitude: "40.7128", longitude: "-74.0060" });
 * revalidateSchoolCache(); // Clear cache
 * ```
 */
export function revalidateSchoolCache(): void {
    revalidateTag("school");
}

/**
 * Gets the user role from the x-user-role header
 * Set by middleware based on authentication or path
 *
 * @returns The user role ("student", "teacher", etc.), or null if not set
 */
export async function getUserRole(): Promise<string | null> {
    const headersList = await headers();
    return headersList.get("x-user-role");
}