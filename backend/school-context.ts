/**
 * School Context Utilities
 *
 * Replaces 12+ duplicated patterns of school context retrieval.
 * Used in student-id.ts, teacher-id.ts, booking-id.ts, events.ts, etc.
 *
 * Single source of truth for getting school ID, timezone, and context.
 *
 * Usage:
 *   const { schoolId, timezone } = await getSchoolContextRequired();
 */

import { headers } from "next/headers";
import { cache } from "react";
import { getSchoolHeader } from "@/types/headers";
import { logger } from "./logger";
import type { ApiActionResponseModel } from "@/types/actions";

/**
 * School context object
 */
export interface SchoolContext {
    schoolId: string;
    timezone: string; //not needed noo more
}

/**
 * Get school context from headers with fallback to database
 *
 * This is the DRY way to get school context. It:
 * 1. Checks headers first (set by proxy.ts middleware)
 * 2. Falls back to database lookup via getSchoolHeader()
 * 3. Returns both schoolId and timezone
 *
 * Returns null if school context cannot be found.
 *
 * Usage:
 *   const context = await getSchoolContext();
 *   if (!context) return { success: false, error: "School not found" };
 *   const { schoolId, timezone } = context;
 */
export const getSchoolContext = cache(async (): Promise<SchoolContext | null> => {
    try {
        // Try headers first (set by proxy.ts)
        const headersList = await headers();
        const schoolIdHeader = headersList.get("x-school-id");
        const timezoneHeader = headersList.get("x-school-timezone");

        if (schoolIdHeader) {
            return {
                schoolId: schoolIdHeader,
                timezone: timezoneHeader || "UTC",
            };
        }

        // Fall back to database lookup
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            logger.warn("School context not found in headers or database");
            return null;
        }

        return {
            schoolId: schoolHeader.id,
            timezone: schoolHeader.zone,
        };
    } catch (error) {
        logger.error("Failed to get school context", error);
        return null;
    }
});

/**
 * Get school context or return error response
 *
 * Convenience wrapper that returns ApiActionResponseModel on failure.
 * Use this in server actions that need school context.
 *
 * Usage in server action:
 *   const contextResult = await getSchoolContextOrFail();
 *   if (!contextResult.success) return contextResult;
 *   const { schoolId, timezone } = contextResult.data;
 */
export async function getSchoolContextOrFail(): Promise<ApiActionResponseModel<SchoolContext>> {
    const context = await getSchoolContext();
    if (!context) {
        return {
            success: false,
            error: "School context not found",
        };
    }
    return {
        success: true,
        data: context,
    };
}

/**
 * Get just the school ID
 *
 * Convenience method for simpler cases.
 */
export async function getSchoolId(): Promise<string | null> {
    const context = await getSchoolContext();
    return context?.schoolId || null;
}
