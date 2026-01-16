"use server";

import { getServerConnection } from "@/supabase/connection";
import { revalidatePath } from "next/cache";
import { handleSupabaseError } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

export async function updateEquipmentStatus(equipmentId: string, status: string) {
    try {
        const supabase = getServerConnection();
        const { error } = await supabase.from("equipment").update({ status }).eq("id", equipmentId);

        if (error) {
            return handleSupabaseError(error, "update equipment status");
        }

        logger.info("Updated equipment status", { equipmentId, status });
        revalidatePath("/equipments");
        return { success: true };
    } catch (error) {
        logger.error("Error updating equipment status", error);
        return { success: false, error: "Failed to update status" };
    }
}
