/**
 * Equipment Seeding
 *
 * Create equipment records for a school
 */

import { supabase } from "./client";

export interface EquipmentInput {
    sku: string;
    brand: string;
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
        // ===== 12 KITES =====
        // 8 Kites - Teacher Assigned (public)
        {
            sku: "KITE-001",
            brand: "Duotone",
            model: "Neo",
            color: "Blue",
            size: 9,
            category: "kite" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "KITE-002",
            brand: "Duotone",
            model: "Neo",
            color: "Red",
            size: 9,
            category: "kite" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "KITE-003",
            brand: "North",
            model: "Carve",
            color: "Blue",
            size: 7,
            category: "kite" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "KITE-004",
            brand: "North",
            model: "Carve",
            color: "Green",
            size: 8,
            category: "kite" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "KITE-005",
            brand: "F-One",
            model: "Breeze",
            color: "Yellow",
            size: 10,
            category: "kite" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "KITE-006",
            brand: "F-One",
            model: "Breeze",
            color: "White",
            size: 12,
            category: "kite" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "KITE-007",
            brand: "Duotone",
            model: "Neo",
            color: "Black",
            size: 6,
            category: "kite" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "KITE-008",
            brand: "North",
            model: "Carve",
            color: "Orange",
            size: 10,
            category: "kite" as const,
            status: "public",
            school_id: schoolId,
        },

        // 4 Kites - Rental
        {
            sku: "KITE-009",
            brand: "Duotone",
            model: "Neo",
            color: "Purple",
            size: 8,
            category: "kite" as const,
            status: "rental",
            school_id: schoolId,
        },
        {
            sku: "KITE-010",
            brand: "North",
            model: "Carve",
            color: "Pink",
            size: 9,
            category: "kite" as const,
            status: "rental",
            school_id: schoolId,
        },
        {
            sku: "KITE-011",
            brand: "F-One",
            model: "Breeze",
            color: "Gray",
            size: 6,
            category: "kite" as const,
            status: "rental",
            school_id: schoolId,
        },
        {
            sku: "KITE-012",
            brand: "F-One",
            model: "Breeze",
            color: "Navy",
            size: 12,
            category: "kite" as const,
            status: "rental",
            school_id: schoolId,
        },

        // ===== 12 WINGS =====
        // 8 Wings - Teacher Assigned (public)
        {
            sku: "WING-001",
            brand: "Duotone",
            model: "Echo",
            color: "Blue",
            size: 4.7,
            category: "wing" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "WING-002",
            brand: "Duotone",
            model: "Echo",
            color: "Red",
            size: 5.2,
            category: "wing" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "WING-003",
            brand: "North",
            model: "Swing",
            color: "Green",
            size: 3.5,
            category: "wing" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "WING-004",
            brand: "North",
            model: "Swing",
            color: "Yellow",
            size: 4.7,
            category: "wing" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "WING-005",
            brand: "F-One",
            model: "Rush",
            color: "White",
            size: 5.2,
            category: "wing" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "WING-006",
            brand: "F-One",
            model: "Rush",
            color: "Black",
            size: 3.5,
            category: "wing" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "WING-007",
            brand: "Duotone",
            model: "Echo",
            color: "Orange",
            size: 4.7,
            category: "wing" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "WING-008",
            brand: "North",
            model: "Swing",
            color: "Purple",
            size: 5.2,
            category: "wing" as const,
            status: "public",
            school_id: schoolId,
        },

        // 4 Wings - Rental
        {
            sku: "WING-009",
            brand: "Duotone",
            model: "Echo",
            color: "Pink",
            size: 3.5,
            category: "wing" as const,
            status: "rental",
            school_id: schoolId,
        },
        {
            sku: "WING-010",
            brand: "North",
            model: "Swing",
            color: "Gray",
            size: 4.7,
            category: "wing" as const,
            status: "rental",
            school_id: schoolId,
        },
        {
            sku: "WING-011",
            brand: "F-One",
            model: "Rush",
            color: "Navy",
            size: 5.2,
            category: "wing" as const,
            status: "rental",
            school_id: schoolId,
        },
        {
            sku: "WING-012",
            brand: "F-One",
            model: "Rush",
            color: "Cyan",
            size: 3.5,
            category: "wing" as const,
            status: "rental",
            school_id: schoolId,
        },

        // ===== 12 WINDSURFS =====
        // 8 Windsurfs - Teacher Assigned (public)
        {
            sku: "WIND-001",
            brand: "Duotone",
            model: "Wave",
            color: "Blue",
            size: 4.7,
            category: "windsurf" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "WIND-002",
            brand: "Duotone",
            model: "Wave",
            color: "Red",
            size: 5.2,
            category: "windsurf" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "WIND-003",
            brand: "North",
            model: "Freestyle",
            color: "Green",
            size: 3.7,
            category: "windsurf" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "WIND-004",
            brand: "North",
            model: "Freestyle",
            color: "Yellow",
            size: 4.7,
            category: "windsurf" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "WIND-005",
            brand: "F-One",
            model: "Freeride",
            color: "White",
            size: 5.2,
            category: "windsurf" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "WIND-006",
            brand: "F-One",
            model: "Freeride",
            color: "Black",
            size: 3.7,
            category: "windsurf" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "WIND-007",
            brand: "Duotone",
            model: "Wave",
            color: "Orange",
            size: 4.7,
            category: "windsurf" as const,
            status: "public",
            school_id: schoolId,
        },
        {
            sku: "WIND-008",
            brand: "North",
            model: "Freestyle",
            color: "Purple",
            size: 5.2,
            category: "windsurf" as const,
            status: "public",
            school_id: schoolId,
        },

        // 4 Windsurfs - Rental
        {
            sku: "WIND-009",
            brand: "Duotone",
            model: "Wave",
            color: "Pink",
            size: 3.7,
            category: "windsurf" as const,
            status: "rental",
            school_id: schoolId,
        },
        {
            sku: "WIND-010",
            brand: "North",
            model: "Freestyle",
            color: "Gray",
            size: 4.7,
            category: "windsurf" as const,
            status: "rental",
            school_id: schoolId,
        },
        {
            sku: "WIND-011",
            brand: "F-One",
            model: "Freeride",
            color: "Navy",
            size: 5.2,
            category: "windsurf" as const,
            status: "rental",
            school_id: schoolId,
        },
        {
            sku: "WIND-012",
            brand: "F-One",
            model: "Freeride",
            color: "Cyan",
            size: 3.7,
            category: "windsurf" as const,
            status: "rental",
            school_id: schoolId,
        },
    ];

    const { data, error } = await supabase.from("equipment").insert(equipment).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} default equipment items (12 kites, 12 wings, 12 windsurfs: 24 public, 12 rental)`);
    return data;
};
