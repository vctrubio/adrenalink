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
