import { getServerConnection } from "@/supabase/connection";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * Syncs the Clerk User's role based on the database records.
 * 
 * Strategy:
 * 1. Database is Source of Truth (via clerk_id columns)
 * 2. Clerk Metadata is Cache (for fast frontend checks)
 * 3. Uses generic 'entityId' that resolves based on the role
 */
export async function syncUserRole(clerkId: string) {
    const supabase = getServerConnection();
    const client = await clerkClient();

    try {
        // 1. Check Owner (School table)
        const { data: owner } = await supabase
            .from("school")
            .select("id, username")
            .eq("clerk_id", clerkId)
            .maybeSingle();

        if (owner) {
            await client.users.updateUserMetadata(clerkId, {
                publicMetadata: {
                    role: "owner",
                    schoolId: owner.id,
                    schoolUsername: owner.username,
                    entityId: owner.id,
                    isActive: true
                }
            });
            return { success: true, role: "owner", schoolId: owner.id };
        }

        // 2. Check Teacher
        const { data: teacher } = await supabase
            .from("teacher")
            .select("id, school_id, active")
            .eq("clerk_id", clerkId)
            .maybeSingle();

        if (teacher) {
            await client.users.updateUserMetadata(clerkId, {
                publicMetadata: {
                    role: "teacher",
                    schoolId: teacher.school_id,
                    entityId: teacher.id,
                    isActive: teacher.active
                }
            });
            return { success: true, role: "teacher", schoolId: teacher.school_id };
        }

        // 3. Check Student (School Students)
        const { data: student } = await supabase
            .from("school_students")
            .select("school_id, rental, student_id, active")
            .eq("clerk_id", clerkId)
            .limit(1)
            .maybeSingle();

        if (student) {
            await client.users.updateUserMetadata(clerkId, {
                publicMetadata: {
                    role: "student",
                    schoolId: student.school_id,
                    entityId: student.student_id,
                    isRental: student.rental,
                    isActive: student.active
                }
            });
            return { success: true, role: "student", schoolId: student.school_id };
        }

        // 4. Default: Authenticated but Unassigned
        await client.users.updateUserMetadata(clerkId, {
            publicMetadata: {
                role: null,
                schoolId: null,
                entityId: null,
                isActive: null,
                isRental: null
            }
        });
        
        return { success: true, role: null };

    } catch (error) {
        console.error("❌ Sync User Role Failed:", error);
        return { success: false, error: "Failed to sync user role" };
    }
}

/**
 * Links a database entity (Teacher or Student) to a Clerk User ID.
 * This is used for manual identity mapping in the Demo/Portal view.
 */
export async function linkEntityToClerk(
    entityId: string, 
    entityType: "teacher" | "student" | "school", 
    clerkId: string
) {
    const supabase = getServerConnection();
    const client = await clerkClient();

    // 1. Validate Clerk User exists before updating DB
    try {
        await client.users.getUser(clerkId);
    } catch (error: any) {
        if (error.status === 404) {
            throw new Error(`Clerk User ID '${clerkId}' not found.`);
        }
        throw error;
    }
    
    if (entityType === "teacher") {
        const { error } = await supabase
            .from("teacher")
            .update({ clerk_id: clerkId })
            .eq("id", entityId);
        if (error) throw error;
    } else if (entityType === "school") {
        // Linking owner/admin to the school table
        const { error } = await supabase
            .from("school")
            .update({ clerk_id: clerkId })
            .eq("id", entityId);
        if (error) throw error;
    } else {
        // Students are linked via school_students table
        const { error } = await supabase
            .from("school_students")
            .update({ clerk_id: clerkId })
            .eq("student_id", entityId);
        if (error) throw error;
    }

    // Immediately sync the role to Clerk metadata so the UI reflects changes
    const syncResult = await syncUserRole(clerkId);
    if (!syncResult.success) throw new Error(syncResult.error);

    return { success: true };
}