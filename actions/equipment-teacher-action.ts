"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { teacherEquipment } from "@/drizzle/schema";
import { getSchoolHeader } from "@/types/headers";

export async function linkTeacherEquipment(equipmentId: string, teacherId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();

        if (!schoolHeader) {
            return { success: false, error: "School not found" };
        }

        // Check if link already exists
        const existing = await db.query.teacherEquipment.findFirst({
            where: (table) => eq(table.equipmentId, equipmentId) && eq(table.teacherId, teacherId),
        });

        if (existing) {
            return { success: false, error: "Teacher already has access to this equipment" };
        }

        // Create the link
        await db.insert(teacherEquipment).values({
            equipmentId,
            teacherId,
            active: true,
        });

        revalidatePath(`/equipments/${equipmentId}`);
        return { success: true };
    } catch (error) {
        console.error("Error linking teacher equipment:", error);
        return { success: false, error: "Failed to link teacher equipment" };
    }
}

export async function unlinkTeacherEquipment(equipmentId: string, teacherId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();

        if (!schoolHeader) {
            return { success: false, error: "School not found" };
        }

        await db.delete(teacherEquipment).where((table) => eq(table.equipmentId, equipmentId) && eq(table.teacherId, teacherId));

        revalidatePath(`/equipments/${equipmentId}`);
        return { success: true };
    } catch (error) {
        console.error("Error unlinking teacher equipment:", error);
        return { success: false, error: "Failed to unlink teacher equipment" };
    }
}
