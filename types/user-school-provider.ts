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
import { MOCK_USERS, MOCK_SCHOOLS, MOCK_USER_SCHOOL_RELATIONS } from "./user";
import {
    isAuthDisabled,
    getDefaultRole,
    getDefaultUserId,
    getDefaultSchoolId,
    getMockUserForRole,
} from "./auth-flags";

/**
 * Get current user - Mock for now, will be replaced with Clerk
 * TODO: Replace with Clerk auth when ready
 *
 * If auth is disabled via NEXT_PUBLIC_DISABLE_AUTH flag:
 * - Returns mock user based on NEXT_PUBLIC_DEFAULT_ROLE
 * - Useful for development/testing without Clerk
 */
async function getCurrentUser(): Promise<UserAuth | null> {
    // If auth is disabled, return mock user based on default role
    if (isAuthDisabled()) {
        const role = getDefaultRole();
        return getMockUserForRole(role);
    }

    // Otherwise, read from a header set by middleware or mock
    // In production with Clerk: const { userId } = await auth();
    const headersList = await headers();
    const userId = headersList.get("x-user-id");

    if (!userId) {
        return null;
    }

    return MOCK_USERS[userId] || null;
}

/**
 * Get school context from headers (set by proxy.ts middleware)
 *
 * If auth is disabled, falls back to default school
 */
async function getSchoolContext() {
    const headersList = await headers();
    const schoolId = headersList.get("x-school-id");
    const schoolUsername = headersList.get("x-school-username");
    const schoolTimezone = headersList.get("x-school-timezone");

    if (schoolId && schoolUsername) {
        return { id: schoolId, username: schoolUsername, timezone: schoolTimezone || "UTC" };
    }

    // If auth is disabled and no school from headers, use default
    if (isAuthDisabled()) {
        const defaultSchoolId = getDefaultSchoolId();
        const defaultSchool = MOCK_SCHOOLS[defaultSchoolId];
        if (defaultSchool) {
            return defaultSchool;
        }
    }

    return null;
}

/**
 * Validate user belongs to school
 * Checks the school_students or school_teachers relations
 */
function validateUserSchoolRelation(userId: string, schoolId: string): boolean {
    const usersInSchool = MOCK_USER_SCHOOL_RELATIONS[schoolId] || [];
    return usersInSchool.includes(userId);
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
 * If NEXT_PUBLIC_DISABLE_AUTH is set (development only):
 * - Skips all validation checks
 * - Returns mock user based on NEXT_PUBLIC_DEFAULT_ROLE
 * - Useful for testing without Clerk
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
        // If auth is disabled, return fully authorized context with defaults
        if (isAuthDisabled()) {
            const school = await getSchoolContext();
            const user = await getCurrentUser();

            if (!school || !user) {
                return {
                    user: null as any,
                    school: null as any,
                    isAuthorized: false,
                    error: "Auth disabled but school or user data missing",
                };
            }

            return {
                user,
                school,
                isAuthorized: true, // Always authorized in dev mode with auth disabled
            };
        }

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
        const isAuthorized = validateUserSchoolRelation(user.id, school.id);
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

/**
 * Check if authentication is disabled (development mode)
 *
 * Useful for determining if you need to skip auth checks in layouts/components
 *
 * Usage in layouts:
 * ```typescript
 * if (isAuthDisabledMode()) {
 *   // Auth is disabled - render without guards
 *   return <div>{children}</div>;
 * }
 * ```
 */
export { isAuthDisabled as isAuthDisabledMode } from "./auth-flags";
