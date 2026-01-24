/**
 * User Types
 * Defines the shape of the authenticated user and their context.
 */

export type UserRole = "school_admin" | "teacher" | "student" | "owner" | "guest";

export interface UserAuth {
    id: string;           // Clerk user ID
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    schoolId: string;     // School UUID they belong to
    entityId?: string;    // Reference to teacher/student record
    isActive?: boolean;
    isRental?: boolean;
}

export interface UserSchoolContext {
    user: UserAuth;
    school: {
        id: string;
        username: string;
        timezone: string;
    };
    isAuthorized: boolean;
    error?: string;
}