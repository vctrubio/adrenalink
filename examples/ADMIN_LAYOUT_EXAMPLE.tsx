/**
 * Example: Admin Layout with Auth Guard
 *
 * Location: src/app/(admin)/layout.tsx
 *
 * This is a reference implementation showing how to:
 * 1. Use getUserSchoolContext() to get auth info
 * 2. Guard routes based on role
 * 3. Redirect unauthorized users
 *
 * Copy this pattern to your actual layout.tsx and customize as needed.
 */

import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
    getUserSchoolContext,
    isSchoolAdmin,
} from "@/types/user-school-provider";

interface AdminLayoutProps {
    children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    // Get the combined user-school context
    // This is memoized per request, so multiple calls are free
    const context = await getUserSchoolContext();

    // Guard 1: Check if user is authenticated and belongs to school
    if (!context.isAuthorized || !context.user) {
        console.warn("Admin access denied - user not authorized");
        redirect("/unauthorized");
    }

    // Guard 2: Check if user has admin role
    if (!isSchoolAdmin(context)) {
        console.warn("Admin access denied - user is not school_admin");
        redirect("/forbidden");
    }

    // If we get here, user is authenticated and authorized
    const { user, school } = context;

    return (
        <div className="min-h-screen bg-background">
            {/* Admin header with school context */}
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

            {/* Admin content */}
            <main className="flex-1">{children}</main>
        </div>
    );
}

/**
 * KEY PATTERNS:
 *
 * 1. Always get context at layout level
 *    const context = await getUserSchoolContext();
 *
 * 2. Check isAuthorized first
 *    if (!context.isAuthorized) redirect("/unauthorized");
 *
 * 3. Check role with helper functions
 *    if (!isSchoolAdmin(context)) redirect("/forbidden");
 *
 * 4. Use context throughout component
 *    const { user, school } = context;
 *
 * 5. Context is request-scoped and memoized
 *    Multiple calls return same cached result
 *
 * MIGRATION NOTES:
 * - This works with both mock users and Clerk
 * - No changes needed when switching from mock to Clerk
 * - Just update auth-utils.ts getCurrentUserFromRequest()
 */
