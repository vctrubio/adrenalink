"use server";

import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { revalidatePath } from "next/cache";
import { handleSupabaseError } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

export async function updateSchoolStudentStatus(studentId: string, isActive: boolean) {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        const supabase = getServerConnection();
        const { error } = await supabase
            .from("school_students")
            .update({ active: isActive })
            .eq("school_id", schoolHeader.id)
            .eq("student_id", studentId);

        if (error) {
            return handleSupabaseError(error, "update student status");
        }

        logger.info("Updated student status", { studentId, isActive });
        revalidatePath("/students");
        return { success: true };
    } catch (error) {
        logger.error("Error updating student status", error);
        return { success: false, error: "Failed to update status" };
    }
}
