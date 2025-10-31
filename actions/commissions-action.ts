"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { teacherCommission, type TeacherCommissionForm, type TeacherCommissionType } from "@/drizzle/schema";
import { createCommissionModel, type CommissionModel } from "@/backend/models";
import type { ApiActionResponseModel } from "@/types/actions";

const commissionWithRelations = {
    teacher: true,
    lessons: true,
};

// CREATE
export async function createCommission(commissionSchema: TeacherCommissionForm): Promise<ApiActionResponseModel<TeacherCommissionType>> {
    try {
        const result = await db.insert(teacherCommission).values(commissionSchema).returning();
        revalidatePath("/commissions");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error creating commission:", error);
        return { success: false, error: "Failed to create commission" };
    }
}

// READ
export async function getCommissions(): Promise<ApiActionResponseModel<CommissionModel[]>> {
    try {
        const result = await db.query.teacherCommission.findMany({
            with: commissionWithRelations,
        });

        const commissions: CommissionModel[] = result.map((commissionData) => {
            return createCommissionModel(commissionData);
        });

        return { success: true, data: commissions };
    } catch (error) {
        console.error("Error fetching commissions:", error);
        return { success: false, error: "Failed to fetch commissions" };
    }
}

export async function getCommissionById(id: string): Promise<ApiActionResponseModel<CommissionModel>> {
    try {
        const result = await db.query.teacherCommission.findFirst({
            where: eq(teacherCommission.id, id),
            with: commissionWithRelations,
        });

        if (result) {
            return { success: true, data: createCommissionModel(result) };
        }
        return { success: false, error: "Commission not found" };
    } catch (error) {
        console.error("Error fetching commission:", error);
        return { success: false, error: "Failed to fetch commission" };
    }
}

// UPDATE
export async function updateCommission(id: string, commissionSchema: Partial<TeacherCommissionForm>): Promise<ApiActionResponseModel<TeacherCommissionType>> {
    try {
        const result = await db.update(teacherCommission).set(commissionSchema).where(eq(teacherCommission.id, id)).returning();
        revalidatePath("/commissions");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error updating commission:", error);
        return { success: false, error: "Failed to update commission" };
    }
}

// DELETE
export async function deleteCommission(id: string): Promise<ApiActionResponseModel<null>> {
    try {
        await db.delete(teacherCommission).where(eq(teacherCommission.id, id));
        revalidatePath("/commissions");
        return { success: true, data: null };
    } catch (error) {
        console.error("Error deleting commission:", error);
        return { success: false, error: "Failed to delete commission" };
    }
}

// RELATIONS
export async function getCommissionsByTeacherId(teacherId: string): Promise<ApiActionResponseModel<CommissionModel[]>> {
    try {
        const result = await db.query.teacherCommission.findMany({
            where: eq(teacherCommission.teacherId, teacherId),
            with: commissionWithRelations,
        });

        const commissions: CommissionModel[] = result.map((commissionData) => {
            return createCommissionModel(commissionData);
        });

        return { success: true, data: commissions };
    } catch (error) {
        console.error("Error fetching commissions by teacher ID:", error);
        return { success: false, error: "Failed to fetch commissions" };
    }
}
