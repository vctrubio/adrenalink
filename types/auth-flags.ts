/**
 * Authentication Feature Flags
 *
 * Controls auth behavior for development vs production.
 *
 * Set in .env.local:
 *   NEXT_PUBLIC_DISABLE_AUTH=true     # Disable all auth checks (development only)
 *   NEXT_PUBLIC_DEFAULT_ROLE=admin    # Default role if auth disabled
 *   NEXT_PUBLIC_DEFAULT_USER_ID=dev   # Default user ID if auth disabled
 *
 * ⚠️ NEVER USE IN PRODUCTION ⚠️
 */

/**
 * Check if authentication is disabled via environment flag
 *
 * Usage in layouts:
 *   if (isAuthDisabled()) {
 *     return <div>{children}</div>; // Skip auth checks
 *   }
 */
export function isAuthDisabled(): boolean {
    if (typeof window === "undefined") {
        // Server-side: check env
        return process.env.NEXT_PUBLIC_DISABLE_AUTH === "true";
    }
    // Client-side: check env
    return process.env.NEXT_PUBLIC_DISABLE_AUTH === "true";
}

/**
 * Get default role when auth is disabled
 *
 * Useful for testing different user types without Clerk
 *
 * Usage:
 *   if (isAuthDisabled()) {
 *     const role = getDefaultRole(); // 'admin', 'teacher', or 'student'
 *   }
 */
export function getDefaultRole(): string {
    return process.env.NEXT_PUBLIC_DEFAULT_ROLE || "admin";
}

/**
 * Get default user ID when auth is disabled
 *
 * Usage:
 *   if (isAuthDisabled()) {
 *     const userId = getDefaultUserId(); // 'dev-user-123'
 *   }
 */
export function getDefaultUserId(): string {
    return process.env.NEXT_PUBLIC_DEFAULT_USER_ID || "dev-user";
}

/**
 * Get default school ID when auth is disabled
 *
 * Useful for multi-tenant development
 */
export function getDefaultSchoolId(): string {
    return process.env.NEXT_PUBLIC_DEFAULT_SCHOOL_ID || "school_001";
}

/**
 * Check if running in development mode with auth disabled
 *
 * This is the safeguard - only allow in dev/test environments
 */
export function isDevelopmentWithAuthDisabled(): boolean {
    const isDev = process.env.NODE_ENV === "development";
    const authDisabled = isAuthDisabled();

    if (authDisabled && !isDev) {
        console.warn(
            "⚠️ SECURITY WARNING: Auth is disabled but NODE_ENV is not development!",
            "NODE_ENV:",
            process.env.NODE_ENV
        );
    }

    return isDev && authDisabled;
}

/**
 * Mock user data for development with auth disabled
 *
 * Returns a mock user that matches the default role
 */
export function getMockUserForRole(role: string) {
    const baseUser = {
        id: getDefaultUserId(),
        email: `${role}@dev.local`,
        firstName: "Dev",
        lastName: role.charAt(0).toUpperCase() + role.slice(1),
        schoolId: getDefaultSchoolId(),
    };

    switch (role) {
        case "admin":
            return {
                ...baseUser,
                role: "school_admin",
                lastName: "Admin",
                email: "admin@dev.local",
            };
        case "teacher":
            return {
                ...baseUser,
                role: "teacher",
                lastName: "Teacher",
                email: "teacher@dev.local",
                entityId: "teacher_dev_001",
            };
        case "student":
            return {
                ...baseUser,
                role: "student",
                lastName: "Student",
                email: "student@dev.local",
                entityId: "student_dev_001",
            };
        default:
            return { ...baseUser, role: "admin" };
    }
}

/**
 * Examples:
 *
 * .env.local (development):
 *   NEXT_PUBLIC_DISABLE_AUTH=true
 *   NEXT_PUBLIC_DEFAULT_ROLE=admin
 *   NEXT_PUBLIC_DEFAULT_USER_ID=dev-user-123
 *   NEXT_PUBLIC_DEFAULT_SCHOOL_ID=school_001
 *
 * .env.local (production):
 *   # Don't set NEXT_PUBLIC_DISABLE_AUTH
 *   # Auth will be enabled by default
 *
 * Usage in layout:
 *   import { isAuthDisabled } from "@/types/auth-flags";
 *
 *   export default async function AdminLayout({ children }) {
 *     const context = await getUserSchoolContext();
 *
 *     // If auth is disabled, skip all checks
 *     if (isAuthDisabled()) {
 *       return <div>{children}</div>;
 *     }
 *
 *     // Otherwise, enforce auth
 *     if (!context.isAuthorized) {
 *       redirect("/unauthorized");
 *     }
 *
 *     return <div>{children}</div>;
 *   }
 */
