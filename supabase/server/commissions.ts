"use server";

import { getServerConnection } from "@/supabase/connection";
import { revalidatePath } from "next/cache";
import type { ApiActionResponseModel } from "@/types/actions";
import { handleSupabaseError, safeArray } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

export interface CommissionData {
    id: string;
    teacher_id: string;
    commission_type: "fixed" | "percentage";
    cph: string;
    description: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CommissionForm {
    teacherId: string;
    commissionType: "fixed" | "percentage";
    cph: string;
    description?: string | null;
}

/**
 * Create a new teacher commission
 */
export async function createCommission(commissionData: CommissionForm): Promise<ApiActionResponseModel<CommissionData>> {
    try {
        const supabase = getServerConnection();
        const { data, error } = await supabase
            .from("teacher_commission")
            .insert({
                teacher_id: commissionData.teacherId,
                commission_type: commissionData.commissionType,
                cph: commissionData.cph,
                description: commissionData.description || null,
            })
            .select()
            .single();

        if (error) {
            return handleSupabaseError(error, "create commission", "Failed to create commission");
        }

        logger.info("Created commission", { commissionId: data.id, teacherId: commissionData.teacherId });
        revalidatePath("/");
        return { success: true, data };
    } catch (error) {
        logger.error("Error creating commission", error);
        return { success: false, error: "Failed to create commission" };
    }
}

/**
 * Delete a teacher commission by ID
 */
export async function deleteCommission(commissionId: string): Promise<ApiActionResponseModel<null>> {
    try {
        const supabase = getServerConnection();
        const { error } = await supabase.from("teacher_commission").delete().eq("id", commissionId);

        if (error) {
            return handleSupabaseError(error, "delete commission", "Failed to delete commission");
        }

        logger.info("Deleted commission", { commissionId });
        revalidatePath("/");
        return { success: true, data: null };
    } catch (error) {
        logger.error("Error deleting commission", error);
        return { success: false, error: "Failed to delete commission" };
    }
}

/**
 * Get all commissions for a teacher
 */
export async function getCommissionsByTeacherId(teacherId: string): Promise<ApiActionResponseModel<CommissionData[]>> {
    try {
        const supabase = getServerConnection();
        const { data, error } = await supabase
            .from("teacher_commission")
            .select("*")
            .eq("teacher_id", teacherId)
            .order("created_at", { ascending: false });

        if (error) {
            return handleSupabaseError(error, "fetch commissions by teacher", "Failed to fetch commissions");
        }

        logger.debug("Fetched teacher commissions", { teacherId, count: safeArray(data).length });
        return { success: true, data: safeArray(data) };
    } catch (error) {
        logger.error("Error fetching commissions", error);
        return { success: false, error: "Failed to fetch commissions" };
    }
}

/**
 * Get a single commission by ID
 */
export async function getCommissionById(commissionId: string): Promise<ApiActionResponseModel<CommissionData>> {
    try {
        const supabase = getServerConnection();

        const { data, error } = await supabase.from("teacher_commission").select("*").eq("id", commissionId).single();

        if (error) {
            return handleSupabaseError(error, "fetch commission by ID", "Commission not found");
        }

        return { success: true, data };
    } catch (error) {
        logger.error("Error in getCommissionById", error);
        return { success: false, error: "Failed to fetch commission" };
    }
}

/**
 * Update a teacher commission
 */
export async function updateCommission(
    commissionId: string,
    updates: Partial<CommissionForm>,
): Promise<ApiActionResponseModel<CommissionData>> {
    try {
        const supabase = getServerConnection();

        const updateData: Record<string, any> = {};
        if (updates.commissionType) updateData.commission_type = updates.commissionType;
        if (updates.cph) updateData.cph = updates.cph;
        if (updates.description !== undefined) updateData.description = updates.description;

        const { data, error } = await supabase.from("teacher_commission").update(updateData).eq("id", commissionId).select().single();

        if (error) {
            return handleSupabaseError(error, "update commission", "Failed to update commission");
        }

        logger.info("Updated commission", { commissionId, updates });
        revalidatePath("/");
        return { success: true, data };
    } catch (error) {
        logger.error("Error updating commission", error);
        return { success: false, error: "Failed to update commission" };
    }
}
