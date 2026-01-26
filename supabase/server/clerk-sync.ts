"use server";

import { getServerConnection } from "@/supabase/connection";
import { clerkClient } from "@clerk/nextjs/server";
import { ClerkUserMetadata } from "@/types/user";

/**
 * Syncs the Clerk User's roles across ALL schools based on database records.
 *
 * Strategy:
 * 1. Sweep all role tables (school, teacher, school_students) for this clerk_id.
 * 2. Build a mapping of schoolId -> ClerkUserMetadata.
 * 3. Store this map in Clerk's publicMetadata.schools.
 */
export async function syncUserRole(clerkId: string) {
    const supabase = getServerConnection();
    const client = await clerkClient();

    try {
        // 1. Fetch all potential identities in parallel
        const [ownerResult, teacherResult, studentResult] = await Promise.all([
            supabase.from("school").select("id, username").eq("clerk_id", clerkId),
            supabase.from("teacher").select("id, school_id, active").eq("clerk_id", clerkId),
            supabase.from("school_students").select("school_id, rental, student_id, active").eq("clerk_id", clerkId),
        ]);

        const schoolMap: Record<string, ClerkUserMetadata> = {};

        // 2. Populate Owners (Schools they own)
        ownerResult.data?.forEach((s) => {
            schoolMap[s.id] = {
                role: "owner",
                entityId: s.id,
                isActive: true,
                isRental: false,
                schoolId: s.id,
            };
        });

        // 3. Populate Teachers
        teacherResult.data?.forEach((t) => {
            // Owner role takes precedence if they are both
            if (!schoolMap[t.school_id]) {
                schoolMap[t.school_id] = {
                    role: "teacher",
                    entityId: t.id,
                    isActive: t.active,
                    isRental: false,
                    schoolId: t.school_id,
                };
            }
        });

        // 4. Populate Students
        studentResult.data?.forEach((s) => {
            // Staff roles take precedence over student roles per school context
            if (!schoolMap[s.school_id]) {
                schoolMap[s.school_id] = {
                    role: "student",
                    entityId: s.student_id,
                    isActive: s.active,
                    isRental: s.rental,
                    schoolId: s.school_id,
                };
            }
        });

        // 5. Update Clerk Metadata
        // We must fetch existing metadata first because Clerk's updateUserMetadata performs a merge.
        // To remove a school that no longer exists in the DB, we must explicitly set its key to null.
        const user = await client.users.getUser(clerkId);
        const existingMetadata = (user.publicMetadata as any) || {};
        const existingSchools = existingMetadata.schools || {};

        const finalSchools: Record<string, any> = { ...schoolMap };

        // Null out any schools that exist in Clerk but are no longer in our DB map
        Object.keys(existingSchools).forEach((sId) => {
            if (!finalSchools[sId]) {
                finalSchools[sId] = null;
            }
        });

        await client.users.updateUserMetadata(clerkId, {
            publicMetadata: {
                schools: finalSchools,
                // Explicitly null out top-level fields to keep metadata clean
                role: null,
                schoolId: null,
                entityId: null,
                isActive: null,
                isRental: null,
                partition: null,
            },
        });

        const schoolIds = Object.keys(schoolMap);
        console.log(`✅ Synced ${schoolIds.length} school contexts for User ${clerkId}`);
        return { success: true, schoolCount: schoolIds.length };
    } catch (error) {
        console.error("❌ Sync User Role Failed:", error);
        return { success: false, error: "Failed to sync user role" };
    }
}

/**
 * Links a database entity (Teacher or Student) to a Clerk User ID.
 */
export async function linkEntityToClerk(entityId: string, entityType: "teacher" | "student" | "school", clerkId: string) {
    const supabase = getServerConnection();
    const client = await clerkClient();

    let clerkUser;
    try {
        clerkUser = await client.users.getUser(clerkId);
    } catch (error: any) {
        if (error.status === 404) {
            throw new Error(`Clerk User ID '${clerkId}' not found.`);
        }
        throw error;
    }

    const clerkEmail = clerkUser.emailAddresses[0]?.emailAddress || null;

    if (entityType === "teacher") {
        const { error } = await supabase.from("teacher").update({ clerk_id: clerkId }).eq("id", entityId);
        if (error) throw error;
    } else if (entityType === "school") {
        const { error } = await supabase.from("school").update({ clerk_id: clerkId }).eq("id", entityId);
        if (error) throw error;
    } else {
        // Students: Set both clerk_id and email from Clerk user
        const { error } = await supabase
            .from("school_students")
            .update({ clerk_id: clerkId, email: clerkEmail })
            .eq("student_id", entityId);
        if (error) throw error;
    }

    const syncResult = await syncUserRole(clerkId);
    if (!syncResult.success) throw new Error(syncResult.error);

    return { success: true };
}

/**
 * Removes the link between a database entity and a Clerk User ID for a SPECIFIC school.
 * Triggered from the Demo/Portal view.
 */
export async function unlinkEntityFromClerk(
    entityId: string,
    entityType: "teacher" | "student" | "school",
    clerkId: string,
    schoolId: string,
) {
    const supabase = getServerConnection();

    if (entityType === "teacher") {
        const { error } = await supabase.from("teacher").update({ clerk_id: null }).eq("id", entityId).eq("school_id", schoolId);
        if (error) throw error;
    } else if (entityType === "school") {
        const { error } = await supabase.from("school").update({ clerk_id: null }).eq("id", entityId);
        if (error) throw error;
    } else {
        // Students: Clear clerk_id and email for this specific school relationship
        const { error } = await supabase
            .from("school_students")
            .update({ clerk_id: null, email: null })
            .eq("student_id", entityId)
            .eq("school_id", schoolId);
        if (error) throw error;
    }

    // Re-sync to rebuild the schools map without this school
    const syncResult = await syncUserRole(clerkId);
    if (!syncResult.success) throw new Error(syncResult.error);

    return { success: true };
}
