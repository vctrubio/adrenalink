"use server";

import { getServerConnection } from "@/supabase/connection";
import { revalidatePath } from "next/cache";
import { handleSupabaseError } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

export async function updateTeacherStatus(teacherId: string, isActive: boolean) {
    try {
        const supabase = getServerConnection();
        const { error } = await supabase.from("teacher").update({ active: isActive }).eq("id", teacherId);

        if (error) {
            return handleSupabaseError(error, "update teacher status");
        }

        logger.info("Updated teacher status", { teacherId, isActive });
        revalidatePath("/teachers");
        return { success: true };
    } catch (error) {
        logger.error("Error updating teacher status", error);
        return { success: false, error: "Failed to update status" };
    }
}
