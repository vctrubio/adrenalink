/**
 * Referral Seeding
 *
 * Create referral codes and commission rules
 */

import { supabase } from "./client";

export interface ReferralInput {
    code: string;
    commission_type: "percentage" | "fixed";
    commission_value: string;
    description?: string;
}

export const createReferrals = async (schoolId: string, referrals: ReferralInput[]): Promise<any[]> => {
    const records = referrals.map((r) => ({
        code: r.code,
        school_id: schoolId,
        commission_type: r.commission_type,
        commission_value: r.commission_value,
        description: r.description,
        active: true,
    }));

    const { data, error } = await supabase.from("referral").insert(records).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} referrals`);
    return data;
};

export const createDefaultReferrals = async (schoolId: string): Promise<any[]> => {
    const referrals = [
        {
            code: "ALFA-2024",
            school_id: schoolId,
            commission_type: "percentage",
            commission_value: "10.00",
            description: "Standard affiliate 10% per booking",
            active: true,
        },
        {
            code: "BETA-2024",
            school_id: schoolId,
            commission_type: "percentage",
            commission_value: "15.00",
            description: "Premium affiliate 15% per booking",
            active: true,
        },
        {
            code: "GAMMA-2024",
            school_id: schoolId,
            commission_type: "fixed",
            commission_value: "50.00",
            description: "Corporate fixed €50 per booking",
            active: true,
        },
        {
            code: "DELTA-2024",
            school_id: schoolId,
            commission_type: "fixed",
            commission_value: "75.00",
            description: "VIP fixed €75 per booking",
            active: true,
        },
        {
            code: "EPSILON-2024",
            school_id: schoolId,
            commission_type: "percentage",
            commission_value: "20.00",
            description: "Premium partner 20% per booking",
            active: true,
        },
    ];

    const { data, error } = await supabase.from("referral").insert(referrals).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} default referrals`);
    return data;
};
