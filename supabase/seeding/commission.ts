/**
 * Teacher Commission Seeding
 *
 * Create commission records for teachers
 */

import { supabase } from "./client";

export interface CommissionInput {
    commission_type: "percentage" | "fixed";
    cph: string;
    description?: string;
}

export const createTeacherCommissions = async (teacherId: string, commissions: CommissionInput[]): Promise<any[]> => {
    const records = commissions.map((c) => ({
        teacher_id: teacherId,
        commission_type: c.commission_type,
        cph: c.cph,
        description: c.description,
        active: true,
    }));

    const { data, error } = await supabase.from("teacher_commission").insert(records).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} commissions for teacher ${teacherId.substring(0, 8)}`);
    return data;
};

export const createDefaultTeacherCommissions = async (teacherId: string): Promise<any[]> => {
    const commissions = [
        { teacher_id: teacherId, commission_type: "percentage", cph: "25.00", description: "Standard", active: true },
        { teacher_id: teacherId, commission_type: "fixed", cph: "20.00", description: "Standard", active: true },
        { teacher_id: teacherId, commission_type: "fixed", cph: "12.00", description: "Supervision", active: true },
    ];

    const { data, error } = await supabase.from("teacher_commission").insert(commissions).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} default commissions for teacher ${teacherId.substring(0, 8)}`);
    return data;
};
