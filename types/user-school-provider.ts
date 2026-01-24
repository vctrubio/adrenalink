/**
 * User-School Provider
 *
 * DRY wrapper that combines school context (from subdomain) with user context.
 * This is the single source of truth for determining:
 * - What school the request is for (from subdomain headers)
 * - Who the user is (will be from Clerk auth)
 * - If the user belongs to this school (validation)
 *
 * Enterprise-grade validation with graceful error handling.
 */

import { headers } from "next/headers";
import { cache } from "react";
import type { UserSchoolContext, UserAuth } from "./user";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Get current user from Clerk
 */
async function getCurrentUser(): Promise<UserAuth | null> {
    const user = await currentUser();
    
    if (!user) return null;

    // Map Clerk user to UserAuth type
    // This assumes metadata has been synced by our sync engine
    return {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        role: (user.publicMetadata.role as any) || "guest",
        schoolId: (user.publicMetadata.schoolId as string) || "",
        entityId: (user.publicMetadata.entityId as string) || "",
    };
}

/**
 * Get school context from headers (set by proxy.ts middleware)
 */
async function getSchoolContext() {
    const headersList = await headers();
    const schoolId = headersList.get("x-school-id");
    const schoolUsername = headersList.get("x-school-username");
    const schoolTimezone = headersList.get("x-school-timezone");

    if (schoolId && schoolUsername) {
        return { id: schoolId, username: schoolUsername, timezone: schoolTimezone || "UTC" };
    }

    return null;
}

/**
 * Validate user belongs to school
 * Relies on the schoolId being present in the user's metadata (synced from DB)
 */
function validateUserSchoolRelation(user: UserAuth, schoolId: string): boolean {
    return user.schoolId === schoolId;
}

/**
 * Main provider - Get combined user-school context with validation
 *
 * Returns:
 * - user: The authenticated user
 * - school: The school from subdomain
 * - isAuthorized: Whether user belongs to this school
 * - error: Any validation errors
 *
 * Usage in server components:
 * ```typescript
 * const context = await getUserSchoolContext();
 * if (!context.isAuthorized) {
 *   redirect("/unauthorized");
 * }
 * ```
 */
export const getUserSchoolContext = cache(
    async (): Promise<UserSchoolContext> => {
        // Normal auth flow - get school from subdomain headers
        const school = await getSchoolContext();
        if (!school) {
            return {
                user: null as any,
                school: null as any,
                isAuthorized: false,
                error: "School not found. Invalid subdomain.",
            };
        }

        // Get current user
        const user = await getCurrentUser();
        if (!user) {
            return {
                user: null as any,
                school,
                isAuthorized: false,
                error: "User not authenticated. Please log in.",
            };
        }

        // Validate user belongs to this school
        // In the new Clerk-sync world, if the user has the schoolId in their metadata, they are authorized.
        const isAuthorized = validateUserSchoolRelation(user, school.id);
        
        if (!isAuthorized) {
            return {
                user,
                school,
                isAuthorized: false,
                error: `User does not belong to school: ${school.username}`,
            };
        }

        // Success - user is authorized for this school
        return {
            user,
            school,
            isAuthorized: true,
        };
    }
);

/**
 * Shorthand for getting just the school context
 * (Already exists in headers.ts but reusable here)
 */
export async function getSchoolHeader() {
    const school = await getSchoolContext();
    if (!school) return null;

    return {
        id: school.id,
        name: school.username,
        zone: school.timezone,
    };
}

/**
 * Shorthand for getting just the user context
 */
export async function getUserContext(): Promise<UserAuth | null> {
    return getCurrentUser();
}

/**
 * Check if user has specific role
 */
export function hasRole(context: UserSchoolContext, role: string | string[]): boolean {
    if (!context.isAuthorized || !context.user) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(context.user.role);
}

/**
 * Check if user is admin for their school
 */
export function isSchoolAdmin(context: UserSchoolContext): boolean {
    return hasRole(context, "school_admin");
}

/**
 * Check if user is teacher
 */
export function isTeacher(context: UserSchoolContext): boolean {
    return hasRole(context, "teacher");
}

/**
 * Check if user is student
 */
export function isStudent(context: UserSchoolContext): boolean {
    return hasRole(context, "student");
}
