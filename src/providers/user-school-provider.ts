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
import type { UserSchoolContext, ClerkData, ClerkUserMetadata } from "@/types/user";
import { currentUser } from "@clerk/nextjs/server";
import { getSchoolHeader } from "@/types/headers";

/**
 * Get Clerk user data
 */
export async function getClerkData(): Promise<ClerkData | null> {
    const user = await currentUser();
    
    if (!user) return null;

    return {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        imageUrl: user.imageUrl || "",
    };
}

/**
 * Get Clerk user metadata for a specific school
 */
export async function getClerkUserMetadata(targetSchoolId?: string): Promise<ClerkUserMetadata | null> {
    const user = await currentUser();
    
    if (!user || !targetSchoolId) return null;

    // Multi-School Logic: Extract context from the 'schools' mapping
    const schools = (user.publicMetadata.schools as Record<string, any>) || {};
    const context = schools[targetSchoolId] as ClerkUserMetadata | undefined;

    if (!context) return null;

    return {
        role: context.role || "guest",
        schoolId: targetSchoolId,
        entityId: context.entityId || "",
        isActive: context.isActive ?? false,
        isRental: context.isRental ?? false,
    };
}

/**
 * Main provider - Get combined user-school context with validation
 */
export const getUserSchoolContext = cache(
    async (): Promise<UserSchoolContext> => {
        // 1. Get school from subdomain headers
        const schoolHeader = await getSchoolHeader();
        
        // 2. Get Clerk user data
        const user = await getClerkData();
        
        // 3. Get Clerk user metadata for this school
        const clerkUserMetadata = await getClerkUserMetadata(schoolHeader?.id);

        if (process.env.NODE_ENV === "development") {
            console.log("🔍 [UserSchoolContext] Resolution:", {
                userId: user?.id || "not_authenticated",
                targetSchool: schoolHeader?.id || "none",
                resolvedRole: clerkUserMetadata?.role || "guest",
                entityId: clerkUserMetadata?.entityId || "none"
            });
        }

        if (!schoolHeader) {
            return {
                user: null,
                clerkUserMetadata: null,
                schoolHeader: null,
            };
        }

        return {
            user,
            clerkUserMetadata,
            schoolHeader,
        };
    }
);

/**
 * Check if user has specific role
 */
export function hasRole(context: UserSchoolContext, role: string | string[]): boolean {
    if (!context.clerkUserMetadata || context.clerkUserMetadata.role === "guest") return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(context.clerkUserMetadata.role);
}