/**
 * Example: Admin Layout with Auth Guards & Development Flag Support
 *
 * Location: src/app/(admin)/layout.tsx
 *
 * This example shows how to:
 * 1. Support auth bypass flag for development
 * 2. Guard routes based on role
 * 3. Work seamlessly with or without Clerk
 *
 * Environment flags (.env.local):
 *
 * Production-like (auth enabled):
 *   NEXT_PUBLIC_DISABLE_AUTH=false
 *
 * Development (auth disabled for testing):
 *   NEXT_PUBLIC_DISABLE_AUTH=true
 *   NEXT_PUBLIC_DEFAULT_ROLE=admin
 */

import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
    getUserSchoolContext,
    isSchoolAdmin,
    isAuthDisabledMode,
} from "@/types/user-school-provider";

interface AdminLayoutProps {
    children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    // Get auth context (respects NEXT_PUBLIC_DISABLE_AUTH flag)
    const context = await getUserSchoolContext();

    // ✅ DEVELOPMENT MODE: If auth is disabled, skip all guards
    // This allows testing without Clerk setup
    if (isAuthDisabledMode()) {
        console.log("⚠️ [DEV MODE] Auth is disabled - bypassing guards");
        return (
            <div className="min-h-screen bg-background">
                <header className="border-b border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <span className="inline-block rounded bg-yellow-500/20 px-2 py-1 text-xs font-semibold text-yellow-600">
                            DEV MODE (Auth Disabled)
                        </span>
                        <h1 className="text-xl font-bold text-foreground">
                            Admin Portal
                        </h1>
                    </div>
                </header>
                <main className="flex-1">{children}</main>
            </div>
        );
    }

    // ✅ PRODUCTION MODE: Enforce authentication and role checks

    // Guard 1: Check if user is authenticated and belongs to school
    if (!context.isAuthorized || !context.user) {
        console.warn(
            "Admin access denied - user not authorized. Redirecting to /unauthorized"
        );
        redirect("/unauthorized");
    }

    // Guard 2: Check if user has admin role
    if (!isSchoolAdmin(context)) {
        console.warn(
            "Admin access denied - user is not school_admin. User role:",
            context.user.role
        );
        redirect("/forbidden");
    }

    // If we get here, user is authenticated and authorized
    const { user, school } = context;

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Admin Portal
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            School: <span className="font-semibold">{school.username}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-medium text-foreground">
                            {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            </header>

            <main className="flex-1">{children}</main>
        </div>
    );
}

/**
 * KEY PATTERNS FOR AUTH FLAG SUPPORT:
 *
 * 1. Check if auth is disabled FIRST
 *    if (isAuthDisabledMode()) {
 *        return <DefaultView />;
 *    }
 *
 * 2. Then enforce auth checks
 *    if (!context.isAuthorized) {
 *        redirect("/unauthorized");
 *    }
 *
 * 3. Development mode should show clear indicator
 *    <span className="bg-yellow-500/20">DEV MODE (Auth Disabled)</span>
 *
 * 4. Logging helps debug auth flow
 *    console.log("⚠️ [DEV MODE] Auth is disabled");
 *    console.warn("Admin access denied - user not authorized");
 *
 * ENVIRONMENT SETUP FOR TESTING:
 *
 * .env.local for admin testing:
 * NEXT_PUBLIC_DISABLE_AUTH=true
 * NEXT_PUBLIC_DEFAULT_ROLE=admin
 * NEXT_PUBLIC_DEFAULT_USER_ID=dev-admin
 * NEXT_PUBLIC_DEFAULT_SCHOOL_ID=school_001
 *
 * .env.local for production:
 * NEXT_PUBLIC_DISABLE_AUTH=false
 * (Clerk auth will be enforced)
 *
 * HOW IT WORKS:
 *
 * 1. User accesses /app/(admin)/home
 * 2. Layout calls getUserSchoolContext()
 * 3. If NEXT_PUBLIC_DISABLE_AUTH=true:
 *    - Returns fully authorized context with mock user
 *    - isAuthDisabledMode() returns true
 *    - Guards are skipped, user gets access
 * 4. If NEXT_PUBLIC_DISABLE_AUTH=false:
 *    - Performs normal Clerk auth
 *    - Validates user role
 *    - Redirects if unauthorized
 *
 * MIGRATION TO CLERK:
 *
 * When Clerk is installed:
 * 1. Keep these guards in place
 * 2. Set NEXT_PUBLIC_DISABLE_AUTH=false
 * 3. getCurrentUser() in user-school-provider will use Clerk
 * 4. Everything else works unchanged
 */
