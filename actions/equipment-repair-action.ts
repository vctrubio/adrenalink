"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { equipmentRepair, type EquipmentRepairForm } from "@/drizzle/schema";
import { getSchoolIdFromHeader } from "@/types/headers";

export async function createEquipmentRepair(
  equipmentId: string,
  repairData: Omit<EquipmentRepairForm, "id" | "createdAt" | "updatedAt">,
): Promise<{ success: boolean; error?: string }> {
  try {
    const schoolId = await getSchoolIdFromHeader();

    if (!schoolId) {
      return { success: false, error: "School not found" };
    }

    await db.insert(equipmentRepair).values({
      ...repairData,
      equipmentId,
    });

    revalidatePath(`/equipments/${equipmentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error creating equipment repair:", error);
    return { success: false, error: "Failed to create repair record" };
  }
}
