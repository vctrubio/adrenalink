/**
 * User Types
 * Defines the shape of the authenticated user and their multi-tenant context.
 */

import type { HeaderContext } from "./headers";

export type UserRole = "school_admin" | "teacher" | "student" | "owner" | "guest";

/**
 * Clerk user data - basic user information from Clerk
 */
export interface ClerkData {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
}

/**
 * School-specific metadata for a user stored in Clerk metadata
 */
export interface ClerkUserMetadata {
    role: UserRole;
    schoolId: string;
    entityId: string;
    isActive: boolean;
    isRental: boolean;
}

export interface UserSchoolContext {
    user: ClerkData | null;
    clerkUserMetadata: ClerkUserMetadata | null;
    schoolHeader: HeaderContext | null;
}
