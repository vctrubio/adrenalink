"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { equipment, teacherEquipment, type EquipmentForm, type EquipmentType } from "@/drizzle/schema";
import { createEquipmentModel, type EquipmentModel } from "@/backend/models";
import type { ApiActionResponseModel } from "@/types/actions";
import type { EquipmentStatus } from "@/types/status";

const equipmentWithRelations = {
    school: true,
    teacherEquipments: {
        with: {
            teacher: true,
        },
    },
    equipmentEvents: {
        with: {
            event: true,
        },
    },
};

// CREATE
export async function createEquipment(equipmentSchema: EquipmentForm): Promise<ApiActionResponseModel<EquipmentType>> {
    try {
        const result = await db.insert(equipment).values(equipmentSchema).returning();
        revalidatePath("/equipments");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error creating equipment:", error);
        return { success: false, error: "Failed to create equipment" };
    }
}

// READ
export async function getEquipments(): Promise<ApiActionResponseModel<EquipmentModel[]>> {
    try {
        const result = await db.query.equipment.findMany({
            with: equipmentWithRelations,
        });

        const equipments: EquipmentModel[] = result.map((equipmentData) => {
            return createEquipmentModel(equipmentData);
        });

        return { success: true, data: equipments };
    } catch (error) {
        console.error("Error fetching equipments:", error);
        return { success: false, error: "Failed to fetch equipments" };
    }
}

export async function getEquipmentById(id: string): Promise<ApiActionResponseModel<EquipmentModel>> {
    try {
        const result = await db.query.equipment.findFirst({
            where: eq(equipment.id, id),
            with: equipmentWithRelations,
        });

        if (result) {
            return { success: true, data: createEquipmentModel(result) };
        }
        return { success: false, error: "Equipment not found" };
    } catch (error) {
        console.error("Error fetching equipment:", error);
        return { success: false, error: "Failed to fetch equipment" };
    }
}

// UPDATE
export async function updateEquipment(id: string, equipmentSchema: Partial<EquipmentForm>): Promise<ApiActionResponseModel<EquipmentType>> {
    try {
        const result = await db.update(equipment).set(equipmentSchema).where(eq(equipment.id, id)).returning();
        revalidatePath("/equipments");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error updating equipment:", error);
        return { success: false, error: "Failed to update equipment" };
    }
}

// DELETE
export async function deleteEquipment(id: string): Promise<ApiActionResponseModel<null>> {
    try {
        await db.delete(equipment).where(eq(equipment.id, id));
        revalidatePath("/equipments");
        return { success: true, data: null };
    } catch (error) {
        console.error("Error deleting equipment:", error);
        return { success: false, error: "Failed to delete equipment" };
    }
}

// RELATIONS
export async function getEquipmentsBySchoolId(schoolId: string): Promise<ApiActionResponseModel<EquipmentModel[]>> {
    try {
        const result = await db.query.equipment.findMany({
            where: eq(equipment.schoolId, schoolId),
            with: equipmentWithRelations,
        });

        const equipments: EquipmentModel[] = result.map((equipmentData) => {
            return createEquipmentModel(equipmentData);
        });

        return { success: true, data: equipments };
    } catch (error) {
        console.error("Error fetching equipments by school ID:", error);
        return { success: false, error: "Failed to fetch equipments" };
    }
}

// UPDATE EQUIPMENT STATUS
export async function updateEquipmentStatus(equipmentId: string, status: EquipmentStatus): Promise<ApiActionResponseModel<EquipmentType>> {
    try {
        const result = await db.update(equipment).set({ status }).where(eq(equipment.id, equipmentId)).returning();

        if (!result[0]) {
            return { success: false, error: "Equipment not found" };
        }

        revalidatePath("/equipments");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error updating equipment status:", error);
        return { success: false, error: "Failed to update equipment status" };
    }
}

// LINK TEACHER TO EQUIPMENT
export async function linkTeacherToEquipment(equipmentId: string, teacherId: string): Promise<ApiActionResponseModel<null>> {
    try {
        await db.insert(teacherEquipment).values({
            equipmentId,
            teacherId,
        });
        revalidatePath("/equipments");
        return { success: true, data: null };
    } catch (error) {
        console.error("Error linking teacher to equipment:", error);
        return { success: false, error: "Failed to link teacher to equipment" };
    }
}

// REMOVE TEACHER FROM EQUIPMENT
export async function removeTeacherFromEquipment(equipmentId: string, teacherId: string): Promise<ApiActionResponseModel<null>> {
    try {
        await db.delete(teacherEquipment).where(
            and(
                eq(teacherEquipment.equipmentId, equipmentId),
                eq(teacherEquipment.teacherId, teacherId)
            )
        );
        revalidatePath("/equipments");
        return { success: true, data: null };
    } catch (error) {
        console.error("Error removing teacher from equipment:", error);
        return { success: false, error: "Failed to remove teacher from equipment" };
    }
}
