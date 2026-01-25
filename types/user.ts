/**
 * User Types
 * Defines the shape of the authenticated user and their multi-tenant context.
 */

export type UserRole = "school_admin" | "teacher" | "student" | "owner" | "guest";

/**
 * The school-specific identity context stored in Clerk metadata
 */
export interface SchoolClerkContext {
    role: UserRole;
    schoolId: string;
    entityId: string;
    isActive: boolean;
    isRental: boolean;
}

/**
 * Global User Authentication object
 */
export interface UserAuth {
    id: string;           // Clerk user ID
    email: string;
    firstName: string;
    lastName: string;
    
    // The specific context resolved for the current school domain
    schoolContext?: SchoolClerkContext;

    // Legacy fields - kept as optional during transition if needed
    // but preferred usage is via schoolContext
    role: UserRole;
    schoolId: string;
    entityId?: string;
}

export interface UserSchoolContext {
    user: UserAuth;
    school: {
        id: string;
        username: string;
        timezone: string;
        currency: string;
    };
    isAuthorized: boolean;
    error?: string;
}
