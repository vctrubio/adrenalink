/**
 * User Types - Mock data structure for Clerk auth integration
 * When Clerk is ready, these types will map to Clerk user metadata
 */

export type UserRole = "school_admin" | "teacher" | "student";

export interface UserAuth {
    id: string;           // Will be Clerk user ID
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    schoolId: string;     // School UUID they belong to
    entityId?: string;    // Reference to teacher/student record if applicable
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

/**
 * Mock User Data - Replace with Clerk integration later
 * For development, simulates different user types
 */
export const MOCK_USERS: Record<string, UserAuth> = {
    "user_admin_001": {
        id: "user_admin_001",
        email: "admin@example.com",
        firstName: "Alice",
        lastName: "Admin",
        role: "school_admin",
        schoolId: "school_001",
    },
    "user_teacher_001": {
        id: "user_teacher_001",
        email: "teacher@example.com",
        firstName: "Bob",
        lastName: "Teacher",
        role: "teacher",
        schoolId: "school_001",
        entityId: "teacher_001",
    },
    "user_student_001": {
        id: "user_student_001",
        email: "student@example.com",
        firstName: "Charlie",
        lastName: "Student",
        role: "student",
        schoolId: "school_001",
        entityId: "student_001",
    },
};

/**
 * Mock School Data - Maps to subdomain
 */
export const MOCK_SCHOOLS: Record<string, { id: string; username: string; timezone: string }> = {
    "school_001": {
        id: "school_001",
        username: "mit",
        timezone: "America/New_York",
    },
    "school_002": {
        id: "school_002",
        username: "stanford",
        timezone: "America/Los_Angeles",
    },
};

/**
 * Mock User-School Relationships
 * Validates if a user belongs to a specific school
 */
export const MOCK_USER_SCHOOL_RELATIONS: Record<string, string[]> = {
    "school_001": ["user_admin_001", "user_teacher_001", "user_student_001"],
    "school_002": ["user_admin_002"],
};
