"use server";

import { getServerConnection } from "@/supabase/connection";
import { revalidatePath } from "next/cache";
import type { ApiActionResponseModel } from "@/types/actions";

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
export async function createCommission(
  commissionData: CommissionForm,
): Promise<ApiActionResponseModel<CommissionData>> {
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
      console.error("Error creating commission:", error);
      return { success: false, error: "Failed to create commission" };
    }

    revalidatePath("/");
    return { success: true, data };
  } catch (error) {
    console.error("Error in createCommission:", error);
    return { success: false, error: "Failed to create commission" };
  }
}

/**
 * Delete a teacher commission by ID
 */
export async function deleteCommission(commissionId: string): Promise<ApiActionResponseModel<null>> {
  try {
    const supabase = getServerConnection();

    const { error } = await supabase
      .from("teacher_commission")
      .delete()
      .eq("id", commissionId);

    if (error) {
      console.error("Error deleting commission:", error);
      return { success: false, error: "Failed to delete commission" };
    }

    revalidatePath("/");
    return { success: true, data: null };
  } catch (error) {
    console.error("Error in deleteCommission:", error);
    return { success: false, error: "Failed to delete commission" };
  }
}

/**
 * Get all commissions for a teacher
 */
export async function getCommissionsByTeacherId(
  teacherId: string,
): Promise<ApiActionResponseModel<CommissionData[]>> {
  try {
    const supabase = getServerConnection();

    const { data, error } = await supabase
      .from("teacher_commission")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching commissions:", error);
      return { success: false, error: "Failed to fetch commissions" };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error in getCommissionsByTeacherId:", error);
    return { success: false, error: "Failed to fetch commissions" };
  }
}

/**
 * Get a single commission by ID
 */
export async function getCommissionById(
  commissionId: string,
): Promise<ApiActionResponseModel<CommissionData>> {
  try {
    const supabase = getServerConnection();

    const { data, error } = await supabase
      .from("teacher_commission")
      .select("*")
      .eq("id", commissionId)
      .single();

    if (error) {
      console.error("Error fetching commission:", error);
      return { success: false, error: "Commission not found" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in getCommissionById:", error);
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

    const { data, error } = await supabase
      .from("teacher_commission")
      .update(updateData)
      .eq("id", commissionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating commission:", error);
      return { success: false, error: "Failed to update commission" };
    }

    revalidatePath("/");
    return { success: true, data };
  } catch (error) {
    console.error("Error in updateCommission:", error);
    return { success: false, error: "Failed to update commission" };
  }
}
