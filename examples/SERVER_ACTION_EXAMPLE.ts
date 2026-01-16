/**
 * Example: Server Action with Auth Context
 *
 * Shows how to use getUserSchoolContext() in server actions
 * to scope queries and check authorization.
 *
 * This pattern ensures:
 * 1. All database queries are scoped to the user's school
 * 2. Authorization is checked before returning data
 * 3. Errors are handled gracefully
 */

"use server";

import { revalidatePath } from "next/cache";
import type { ApiActionResponseModel } from "@/types/actions";
import { getServerConnection } from "@/supabase/connection";
import {
    getUserSchoolContext,
    isSchoolAdmin,
    isTeacher,
} from "@/types/user-school-provider";

/**
 * Example 1: Admin-only action
 * Get all school data (admin only)
 */
export async function getSchoolAdminData(): Promise<
    ApiActionResponseModel<any>
> {
    const context = await getUserSchoolContext();

    // Check authorization
    if (!context.isAuthorized || !context.user) {
        return {
            success: false,
            error: "Not authenticated",
        };
    }

    if (!isSchoolAdmin(context)) {
        return {
            success: false,
            error: "Only school admins can access this data",
        };
    }

    try {
        const supabase = getServerConnection();

        // Query is automatically scoped to this school via header
        const { data, error } = await supabase
            .from("school")
            .select("*")
            .eq("id", context.school.id)
            .single();

        if (error) throw error;

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Error fetching school data:", error);
        return {
            success: false,
            error: "Failed to fetch school data",
        };
    }
}

/**
 * Example 2: Role-based data access
 * Get user's own data (teacher or student)
 */
export async function getUserOwnData(): Promise<ApiActionResponseModel<any>> {
    const context = await getUserSchoolContext();

    // Check authentication
    if (!context.isAuthorized || !context.user) {
        return {
            success: false,
            error: "Not authenticated",
        };
    }

    // Check authorization - must be teacher or student
    if (!isTeacher(context)) {
        return {
            success: false,
            error: "Teachers only",
        };
    }

    try {
        const supabase = getServerConnection();

        // Fetch this teacher's data
        const { data, error } = await supabase
            .from("teacher")
            .select("*")
            .eq("school_id", context.school.id)
            .eq("id", context.user.entityId) // Use entityId to find teacher record
            .single();

        if (error) throw error;

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Error fetching teacher data:", error);
        return {
            success: false,
            error: "Failed to fetch your data",
        };
    }
}

/**
 * Example 3: Mutation with auth guard
 * Create a booking (student or teacher)
 */
export async function createBooking(bookingData: {
    student_id: string;
    teacher_id: string;
    date: string;
}): Promise<ApiActionResponseModel<any>> {
    const context = await getUserSchoolContext();

    // Guard 1: Authentication
    if (!context.isAuthorized || !context.user) {
        return { success: false, error: "Not authenticated" };
    }

    // Guard 2: Authorization - only students or teachers can book
    if (!isTeacher(context)) {
        return {
            success: false,
            error: "Only teachers can create bookings",
        };
    }

    try {
        const supabase = getServerConnection();

        // Create booking scoped to this school
        const { data, error } = await supabase
            .from("booking")
            .insert({
                ...bookingData,
                school_id: context.school.id, // Always scope to school
                created_by: context.user.id,
            })
            .select()
            .single();

        if (error) throw error;

        // Revalidate the bookings page
        revalidatePath("/app/(users)/teacher/bookings");

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Error creating booking:", error);
        return {
            success: false,
            error: "Failed to create booking",
        };
    }
}

/**
 * PATTERNS TO FOLLOW:
 *
 * 1. Always start with context check
 *    const context = await getUserSchoolContext();
 *
 * 2. Check isAuthorized before proceeding
 *    if (!context.isAuthorized) return { success: false, error: "..." };
 *
 * 3. Check role with helper functions
 *    if (!isSchoolAdmin(context)) return { success: false, error: "..." };
 *
 * 4. Scope all queries to school
 *    .eq("school_id", context.school.id)
 *
 * 5. Use context.user.id for audit trails
 *    created_by: context.user.id
 *
 * 6. Return { success, data/error } pattern
 *    Consistent with ApiActionResponseModel type
 *
 * 7. Revalidate affected paths
 *    revalidatePath("/relevant/path");
 *
 * BENEFITS:
 * - ✅ Single source of truth for auth
 * - ✅ No duplicate authorization checks
 * - ✅ All queries automatically scoped
 * - ✅ DRY - use helper functions
 * - ✅ Type-safe - full TypeScript support
 * - ✅ Easy to audit - all auth in one place
 */
