/**
 * Header Constants - Single source of truth for header names
 *
 * Used throughout the app for:
 * - Setting headers in middleware (proxy.ts)
 * - Reading headers in server components
 * - Type-safe header access
 */

export const HEADER_KEYS = {
    // School context (from subdomain detection)
    SCHOOL_ID: "x-school-id",
    SCHOOL_USERNAME: "x-school-username",
    SCHOOL_TIMEZONE: "x-school-timezone",

    // User context (from auth/mock)
    USER_ID: "x-user-id",
    USER_EMAIL: "x-user-email",
    USER_ROLE: "x-user-role",
    USER_NAME: "x-user-name",

    // Validation flags
    USER_AUTHORIZED: "x-user-authorized",
} as const;

/**
 * Type-safe header keys
 */
export type HeaderKey = (typeof HEADER_KEYS)[keyof typeof HEADER_KEYS];

/**
 * Helper to get header safely with type checking
 */
export function getHeader(headersList: any, key: HeaderKey): string | null {
    return headersList.get(key);
}

/**
 * Helper to set header safely
 */
export function setHeader(response: any, key: HeaderKey, value: string | null): void {
    if (value !== null && value !== undefined) {
        response.headers.set(key, value);
    }
}
