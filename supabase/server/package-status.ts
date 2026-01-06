"use server";

import { getServerConnection } from "@/supabase/connection";
import { revalidatePath } from "next/cache";

export async function updatePackageStatus(packageId: string, updates: { active?: boolean; is_public?: boolean }) {
    try {
        const supabase = getServerConnection();

        const { error } = await supabase
            .from("school_package")
            .update(updates)
            .eq("id", packageId);

        if (error) {
            console.error("Error updating package status:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/packages");
        return { success: true };
    } catch (error) {
        console.error("Unexpected error updating package status:", error);
        return { success: false, error: "Failed to update package" };
    }
}
