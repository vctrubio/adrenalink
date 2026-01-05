/**
 * Equipment Seeding
 * 
 * Create equipment records for a school
 */

import { supabase } from "./client";

export interface EquipmentInput {
    sku: string;
    model: string;
    color: string;
    size: number;
    category: "kite" | "wing" | "windsurf";
    status?: string;
}

export const createEquipment = async (schoolId: string, equipment: EquipmentInput[]): Promise<any[]> => {
    const records = equipment.map((e) => ({
        ...e,
        school_id: schoolId,
        status: e.status || "rental",
    }));

    const { data, error } = await supabase.from("equipment").insert(records).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} equipment items`);
    return data;
};

export const createDefaultEquipment = async (schoolId: string): Promise<any[]> => {
    const equipment = [
        { sku: `KITE001-${crypto.randomUUID()}`, model: "Duotone Neo 9m", color: "Blue", size: 9, category: "kite" as const, status: "rental", school_id: schoolId },
        { sku: `KITE002-${crypto.randomUUID()}`, model: "North Carve 7m", color: "Red", size: 7, category: "kite" as const, status: "rental", school_id: schoolId },
        { sku: `WING001-${crypto.randomUUID()}`, model: "Duotone Echo 5m", color: "Green", size: 5, category: "wing" as const, status: "rental", school_id: schoolId },
        { sku: `WING002-${crypto.randomUUID()}`, model: "F-One Swing 4.2m", color: "Yellow", size: 4, category: "wing" as const, status: "rental", school_id: schoolId },
    ];

    const { data, error } = await supabase.from("equipment").insert(equipment).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} default equipment items`);
    return data;
};
