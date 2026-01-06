"use server";

import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { revalidatePath } from "next/cache";

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
            console.error("Error updating student status:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/students");
        return { success: true };
    } catch (error) {
        console.error("Unexpected error updating student status:", error);
        return { success: false, error: "Failed to update status" };
    }
}
