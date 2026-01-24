/**
 * Auth Utilities - Helpers for integrating user auth into middleware
 *
 * These utilities are used by proxy.ts to:
 * 1. Extract user from auth system (mock/Clerk)
 * 2. Validate user belongs to school
 * 3. Inject user headers into response
 *
 * DRY approach - single place to configure auth logic
 */

import type { NextRequest, NextResponse } from "next/server";
import { HEADER_KEYS, setHeader } from "./header-constants";
import { MOCK_USERS, MOCK_USER_SCHOOL_RELATIONS, type UserAuth } from "./user";

/**
 * Get current user from request
 * TODO: Replace with Clerk auth() call when ready
 *
 * For now, reads from cookie or header set by test client
 */
export function getCurrentUserFromRequest(request: NextRequest): UserAuth | null {
    // Method 1: From x-user-id header (for testing/development)
    const userId = request.headers.get("x-user-id");
    if (userId && MOCK_USERS[userId]) {
        return MOCK_USERS[userId];
    }

    // Method 2: From Clerk auth (TODO)
    // const { userId } = await auth();
    // if (userId) {
    //   return await getClerkUserData(userId);
    // }

    return null;
}

/**
 * Validate if user has access to school
 */
export function validateUserSchoolAccess(userId: string, schoolId: string): boolean {
    const usersInSchool = MOCK_USER_SCHOOL_RELATIONS[schoolId] || [];
    return usersInSchool.includes(userId);
}

/**
 * Inject user headers into response
 * Called by proxy.ts after validating user
 */
export function injectUserHeaders(
    response: NextResponse,
    user: UserAuth,
    isAuthorized: boolean
): void {
    setHeader(response, HEADER_KEYS.USER_ID, user.id);
    setHeader(response, HEADER_KEYS.USER_EMAIL, user.email);
    setHeader(response, HEADER_KEYS.USER_ROLE, user.role);
    setHeader(response, HEADER_KEYS.USER_NAME, `${user.firstName} ${user.lastName}`);
    setHeader(response, HEADER_KEYS.USER_AUTHORIZED, isAuthorized ? "true" : "false");
}

/**
 * Determine route redirect based on user role
 *
 * Rules:
 * - school_admin → /app/(admin)/*
 * - teacher → /app/(users)/teacher/[id]
 * - student → /app/(users)/student/[id]
 *
 * For subdomain requests, we rewrite to the correct portal
 */
export function getRoleBasedPath(role: string, userId: string): string {
    switch (role) {
        case "school_admin":
            return "/app/(admin)/home";
        case "teacher":
            return `/app/(users)/teacher/${userId}`;
        case "student":
            return `/app/(users)/student/${userId}`;
        default:
            return "/unauthorized";
    }
}

/**
 * Helper to check if path should skip auth
 * (static assets, public routes, etc.)
 */
export const PUBLIC_PATHS = [
    "/_next/",
    "/api/public/",
    "/discover",
    "/about",
    "/welcome",
    "/demo",
    /\.(js|css|woff|woff2|ttf|eot|svg|ico|png|jpg|jpeg|gif|webp)$/,
];

export function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some((path) => {
        if (path instanceof RegExp) {
            return path.test(pathname);
        }
        return pathname.startsWith(path);
    });
}
