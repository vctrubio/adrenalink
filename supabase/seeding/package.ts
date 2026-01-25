/**
 * Package Seeding
 *
 * Create school packages and student packages
 */

import { supabase } from "./client";

export interface SchoolPackageInput {
    duration_minutes: number;
    description: string;
    price_per_student: number;
    capacity_students: number;
    capacity_equipment: number;
    category_equipment: string;
    package_type: "lessons" | "rental";
}

export const createSchoolPackages = async (schoolId: string, packages: SchoolPackageInput[]): Promise<any[]> => {
    const records = packages.map((p) => ({
        ...p,
        school_id: schoolId,
        is_public: true,
        active: true,
    }));

    const { data, error } = await supabase.from("school_package").insert(records).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} school packages`);
    return data;
};

export const createDefaultSchoolPackages = async (schoolId: string): Promise<any[]> => {
    const packages = [
        // ===== KITE PACKAGES =====
        {
            duration_minutes: 120,
            price_per_student: 180,
            capacity_students: 1,
            capacity_equipment: 1,
            category_equipment: "kite",
            package_type: "lessons" as const,
            school_id: schoolId,
            description: "Private Lesson",
            is_public: true,
            active: true,
        },
        {
            duration_minutes: 180,
            price_per_student: 160,
            capacity_students: 2,
            capacity_equipment: 2,
            category_equipment: "kite",
            package_type: "lessons" as const,
            school_id: schoolId,
            description: "Semi Private",
            is_public: true,
            active: true,
        },
        {
            duration_minutes: 480,
            price_per_student: 360,
            capacity_students: 1,
            capacity_equipment: 1,
            category_equipment: "kite",
            package_type: "lessons" as const,
            school_id: schoolId,
            description: "Zero to Hero",
            is_public: true,
            active: true,
        },
        {
            duration_minutes: 360,
            price_per_student: 220,
            capacity_students: 4,
            capacity_equipment: 4,
            category_equipment: "kite",
            package_type: "lessons" as const,
            school_id: schoolId,
            description: "Group (4 Students)",
            is_public: true,
            active: true,
        },
        {
            duration_minutes: 240,
            price_per_student: 200,
            capacity_students: 1,
            capacity_equipment: 1,
            category_equipment: "kite",
            package_type: "rental" as const,
            school_id: schoolId,
            description: "Full Day",
            is_public: true,
            active: true,
        },

        // ===== WING PACKAGES =====
        {
            duration_minutes: 120,
            price_per_student: 180,
            capacity_students: 1,
            capacity_equipment: 1,
            category_equipment: "wing",
            package_type: "lessons" as const,
            school_id: schoolId,
            description: "Private Lesson",
            is_public: true,
            active: true,
        },
        {
            duration_minutes: 180,
            price_per_student: 160,
            capacity_students: 2,
            capacity_equipment: 2,
            category_equipment: "wing",
            package_type: "lessons" as const,
            school_id: schoolId,
            description: "Semi Private",
            is_public: true,
            active: true,
        },
        {
            duration_minutes: 480,
            price_per_student: 360,
            capacity_students: 1,
            capacity_equipment: 1,
            category_equipment: "wing",
            package_type: "lessons" as const,
            school_id: schoolId,
            description: "Zero to Hero",
            is_public: true,
            active: true,
        },
        {
            duration_minutes: 360,
            price_per_student: 220,
            capacity_students: 4,
            capacity_equipment: 4,
            category_equipment: "wing",
            package_type: "lessons" as const,
            school_id: schoolId,
            description: "Group (4 Students)",
            is_public: true,
            active: true,
        },
        {
            duration_minutes: 240,
            price_per_student: 200,
            capacity_students: 1,
            capacity_equipment: 1,
            category_equipment: "wing",
            package_type: "rental" as const,
            school_id: schoolId,
            description: "Full Day",
            is_public: true,
            active: true,
        },

        // ===== WINDSURF PACKAGES =====
        {
            duration_minutes: 120,
            price_per_student: 180,
            capacity_students: 1,
            capacity_equipment: 1,
            category_equipment: "windsurf",
            package_type: "lessons" as const,
            school_id: schoolId,
            description: "Private Lesson",
            is_public: true,
            active: true,
        },
        {
            duration_minutes: 180,
            price_per_student: 160,
            capacity_students: 2,
            capacity_equipment: 2,
            category_equipment: "windsurf",
            package_type: "lessons" as const,
            school_id: schoolId,
            description: "Semi Private",
            is_public: true,
            active: true,
        },
        {
            duration_minutes: 480,
            price_per_student: 360,
            capacity_students: 1,
            capacity_equipment: 1,
            category_equipment: "windsurf",
            package_type: "lessons" as const,
            school_id: schoolId,
            description: "Zero to Hero",
            is_public: true,
            active: true,
        },
        {
            duration_minutes: 360,
            price_per_student: 220,
            capacity_students: 4,
            capacity_equipment: 4,
            category_equipment: "windsurf",
            package_type: "lessons" as const,
            school_id: schoolId,
            description: "Group (4 Students)",
            is_public: true,
            active: true,
        },
        {
            duration_minutes: 240,
            price_per_student: 200,
            capacity_students: 1,
            capacity_equipment: 1,
            category_equipment: "windsurf",
            package_type: "rental" as const,
            school_id: schoolId,
            description: "Full Day",
            is_public: true,
            active: true,
        },
    ];

    const { data, error } = await supabase.from("school_package").insert(packages).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} default school packages (15: 5 per sport - Kite, Wing, Windsurf)`);
    return data;
};

export const createStudentPackages = async (schoolPackageIds: string[]): Promise<any[]> => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const packages = schoolPackageIds.map((pkgId) => ({
        school_package_id: pkgId,
        referral_id: null as any,
        requested_clerk_id: `seed-${crypto.randomUUID().slice(0, 8)}`,
        requested_date_start: startDate.toISOString().split("T")[0],
        requested_date_end: endDate.toISOString().split("T")[0],
        status: "accepted",
    }));

    const { data, error } = await supabase.from("student_package").insert(packages).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} student packages`);
    return data;
};
