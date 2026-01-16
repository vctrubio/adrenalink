/**
 * Example: Users Layout with Auth Guard
 *
 * Location: src/app/(users)/layout.tsx
 *
 * This is a reference implementation showing how to:
 * 1. Guard access for teacher/student users
 * 2. Handle both teacher and student roles
 * 3. Redirect based on role mismatch
 *
 * Copy this pattern to your actual layout.tsx and customize as needed.
 */

import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
    getUserSchoolContext,
    hasRole,
    isTeacher,
    isStudent,
} from "@/types/user-school-provider";

interface UsersLayoutProps {
    children: ReactNode;
}

export default async function UsersLayout({ children }: UsersLayoutProps) {
    // Get combined user-school context
    const context = await getUserSchoolContext();

    // Guard 1: Check if user is authenticated and belongs to school
    if (!context.isAuthorized || !context.user) {
        console.warn("Users access denied - user not authorized");
        redirect("/unauthorized");
    }

    // Guard 2: Check if user is either teacher or student
    // (admin users should go to (admin) routes instead)
    if (!hasRole(context, ["teacher", "student"])) {
        console.warn(
            "Users access denied - user role is",
            context.user.role
        );
        redirect("/forbidden");
    }

    const { user, school } = context;

    return (
        <div className="min-h-screen bg-background">
            {/* User header with context */}
            <header className="border-b border-border bg-card">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            {isTeacher(context) ? "Teacher" : "Student"} Portal
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {school.username}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-medium text-foreground">
                            {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {isTeacher(context) ? "Teacher" : "Student"}
                        </p>
                    </div>
                </div>
            </header>

            {/* User content */}
            <main className="flex-1">{children}</main>
        </div>
    );
}

/**
 * PATTERN VARIATIONS:
 *
 * Option A: Accept both teacher and student
 *   if (!hasRole(context, ["teacher", "student"])) redirect("/forbidden");
 *
 * Option B: Separate layouts for teacher vs student
 *   // In src/app/(users)/teacher/layout.tsx
 *   if (!isTeacher(context)) redirect("/forbidden");
 *
 *   // In src/app/(users)/student/layout.tsx
 *   if (!isStudent(context)) redirect("/forbidden");
 *
 * Option C: Different content based on role
 *   if (isTeacher(context)) {
 *       return <TeacherPortal />;
 *   } else if (isStudent(context)) {
 *       return <StudentPortal />;
 *   }
 *
 * CONTEXT CACHING:
 * - getUserSchoolContext() uses React's cache()
 * - Multiple calls in same request return same cached result
 * - Efficient for layouts + child components
 *
 * ERROR HANDLING:
 * - isAuthorized = false → user not in school_students/school_teachers
 * - user = null → no authentication
 * - role mismatch → user in wrong route group
 */
