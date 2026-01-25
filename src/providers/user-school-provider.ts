/**
 * User-School Provider
 *
 * DRY wrapper that combines school context (from subdomain) with user context.
 * This is the single source of truth for determining:
 * - What school the request is for (from subdomain headers)
 * - Who the user is (from Clerk auth)
 * - The specific role the user holds for this school (from mapped metadata)
 */

import { cache } from "react";
import type { UserSchoolContext, UserAuth, SchoolClerkContext } from "@/types/user";
import { currentUser } from "@clerk/nextjs/server";
import { getSchoolHeader } from "@/types/headers";

/**
 * Get current user from Clerk
 * Resolves context based on the provided schoolId
 */
export async function getUserContext(targetSchoolId?: string): Promise<UserAuth | null> {
    const user = await currentUser();
    
    if (!user) return null;

    // Multi-School Logic: Strictly extract context from the 'schools' mapping
    const schools = (user.publicMetadata.schools as Record<string, any>) || {};
    const context = targetSchoolId ? (schools[targetSchoolId] as SchoolClerkContext) : null;

    // If no specific school context is found, we provide a guest context
    const resolvedContext: SchoolClerkContext = {
        role: context?.role || "guest",
        schoolId: targetSchoolId || "",
        entityId: context?.entityId || "",
        isActive: context?.isActive ?? false,
        isRental: context?.isRental ?? false,
    };

    return {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        
        // New Typed Context
        schoolContext: resolvedContext,

        // Legacy flattening for compatibility
        role: resolvedContext.role,
        schoolId: resolvedContext.schoolId,
        entityId: resolvedContext.entityId,
    };
}

/**
 * Main provider - Get combined user-school context with validation
 */
export const getUserSchoolContext = cache(
    async (): Promise<UserSchoolContext> => {
        // 1. Get school from subdomain headers
        const schoolHeader = await getSchoolHeader();
        const school = schoolHeader ? { 
            id: schoolHeader.id, 
            username: schoolHeader.name, 
            timezone: schoolHeader.zone,
            currency: schoolHeader.currency
        } : null;
        
        // 2. Get current user, targeting this specific school context
        const user = await getUserContext(school?.id);

        if (process.env.NODE_ENV === "development") {
            console.log("🔍 [UserSchoolContext] Resolution:", {
                userId: user?.id || "not_authenticated",
                targetSchool: school?.id || "none",
                resolvedRole: user?.schoolContext?.role || "guest",
                entityId: user?.schoolContext?.entityId || "none"
            });
        }

        if (!school) {
            return {
                user: null as any,
                school: null as any,
                isAuthorized: false,
                error: "School context missing. Please access via a valid subdomain.",
            };
        }

        if (!user || user.schoolContext?.role === "guest") {
            return {
                user: user as any,
                school,
                isAuthorized: false,
                error: user ? "User is not registered for this school." : "User not authenticated.",
            };
        }

        // 3. Validation
        const isAuthorized = !!user.schoolContext && user.schoolContext.role !== "guest";
        
        return {
            user,
            school,
            isAuthorized,
            error: isAuthorized ? undefined : `You do not have access to ${school.username}.`,
        };
    }
);

/**
 * Check if user has specific role
 */
export function hasRole(context: UserSchoolContext, role: string | string[]): boolean {
    if (!context.isAuthorized || !context.user || !context.user.schoolContext) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(context.user.schoolContext.role);
}