"use server";

import { getServerConnection } from "@/supabase/connection";
import { revalidatePath } from "next/cache";

export async function updateTeacherStatus(teacherId: string, isActive: boolean) {
    try {
        const supabase = getServerConnection();

        const { error } = await supabase.from("teacher").update({ active: isActive }).eq("id", teacherId);

        if (error) {
            console.error("Error updating teacher status:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/teachers");
        return { success: true };
    } catch (error) {
        console.error("Unexpected error updating teacher status:", error);
        return { success: false, error: "Failed to update status" };
    }
}
