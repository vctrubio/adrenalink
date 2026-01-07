"use server";

import { getServerConnection } from "@/supabase/connection";
import { revalidatePath } from "next/cache";

export async function updateEquipmentStatus(equipmentId: string, status: string) {
    try {
        const supabase = getServerConnection();

        const { error } = await supabase
            .from("equipment")
            .update({ status })
            .eq("id", equipmentId);

        if (error) {
            console.error("Error updating equipment status:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/equipments");
        return { success: true };
    } catch (error) {
        console.error("Unexpected error updating equipment status:", error);
        return { success: false, error: "Failed to update status" };
    }
}
