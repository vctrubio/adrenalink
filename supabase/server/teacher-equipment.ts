"use server";

import { getServerConnection } from "@/supabase/connection";
import { revalidatePath } from "next/cache";
import { logger } from "@/backend/logger";
import { isUniqueConstraintError } from "@/backend/error-handlers";

export async function linkTeacherToEquipment(equipmentId: string, teacherId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = getServerConnection();

        // Try to insert, if exists update active status
        const { error: insertError } = await supabase.from("teacher_equipment").insert({
            teacher_id: teacherId,
            equipment_id: equipmentId,
            active: true,
        });

        if (insertError) {
            // If conflict (duplicate), set active to true
            if (isUniqueConstraintError(insertError)) {
                const { error: updateError } = await supabase
                    .from("teacher_equipment")
                    .update({ active: true })
                    .eq("teacher_id", teacherId)
                    .eq("equipment_id", equipmentId);

                if (updateError) {
                    return { success: false, error: "Failed to link teacher to equipment" };
                }
            } else {
                return { success: false, error: "Failed to link teacher to equipment" };
            }
        }

        revalidatePath("/equipments");
        revalidatePath("/teachers");
        return { success: true };
    } catch (error) {
        logger.error("Error linking teacher to equipment", error);
        return { success: false, error: "Failed to link teacher to equipment" };
    }
}

export async function removeTeacherFromEquipment(
    equipmentId: string,
    teacherId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = getServerConnection();

        const { error } = await supabase
            .from("teacher_equipment")
            .delete()
            .eq("teacher_id", teacherId)
            .eq("equipment_id", equipmentId);

        if (error) {
            return { success: false, error: "Failed to remove teacher from equipment" };
        }

        revalidatePath("/equipments");
        revalidatePath("/teachers");
        return { success: true };
    } catch (error) {
        logger.error("Error removing teacher from equipment", error);
        return { success: false, error: "Failed to remove teacher from equipment" };
    }
}
