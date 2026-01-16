"use server";

import { getServerConnection } from "@/supabase/connection";
import { revalidatePath } from "next/cache";
import { handleSupabaseError } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

export async function updatePackageStatus(packageId: string, updates: { active?: boolean; is_public?: boolean }) {
    try {
        const supabase = getServerConnection();
        const { error } = await supabase.from("school_package").update(updates).eq("id", packageId);

        if (error) {
            return handleSupabaseError(error, "update package status");
        }

        logger.info("Updated package status", { packageId, updates });
        revalidatePath("/packages");
        return { success: true };
    } catch (error) {
        logger.error("Error updating package status", error);
        return { success: false, error: "Failed to update package" };
    }
}
