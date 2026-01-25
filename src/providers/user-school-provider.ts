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

import { cache } from "react";
import type { UserSchoolContext, UserAuth } from "@/types/user";
import { currentUser } from "@clerk/nextjs/server";
import { getSchoolHeader } from "@/types/headers";

/**
 * Get current user from Clerk
 * Direct replacement for previous wrapper
 */
export async function getUserContext(): Promise<UserAuth | null> {
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
        const schoolHeader = await getSchoolHeader();
        const school = schoolHeader ? { id: schoolHeader.id, username: schoolHeader.name, timezone: schoolHeader.zone } : null;
        
        // Get current user
        const user = await getUserContext();

        // Debug Log for Identity
        console.log("🔍 CLERK_ID_DEBUG:", {
            userId: user?.id || "not_authenticated",
            role: user?.role || "none",
            metadata: {
                schoolId: user?.schoolId,
                entityId: user?.entityId
            },
            targetSchool: school?.id || "no_school_detected"
        });

        if (!school) {
            return {
                user: null as any,
                school: null as any,
                isAuthorized: false,
                error: "School not found. Invalid subdomain.",
            };
        }
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
        const isAuthorized = user.schoolId === school.id;
        
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
 * Check if user has specific role
 */
export function hasRole(context: UserSchoolContext, role: string | string[]): boolean {
    if (!context.isAuthorized || !context.user) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(context.user.role);
}
