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
        { duration_minutes: 120, price_per_student: 120, capacity_students: 1, capacity_equipment: 1, category_equipment: "kite", package_type: "lessons", school_id: schoolId, description: "Private Kite Lesson", is_public: true, active: true },
        { duration_minutes: 90, price_per_student: 90, capacity_students: 1, capacity_equipment: 1, category_equipment: "wing", package_type: "lessons", school_id: schoolId, description: "Private Wing Lesson", is_public: true, active: true },
        { duration_minutes: 120, price_per_student: 75, capacity_students: 2, capacity_equipment: 2, category_equipment: "kite", package_type: "lessons", school_id: schoolId, description: "Duo Kite Lesson", is_public: true, active: true },
        { duration_minutes: 150, price_per_student: 65, capacity_students: 3, capacity_equipment: 3, category_equipment: "wing", package_type: "lessons", school_id: schoolId, description: "Group Wing Lesson (3 Students)", is_public: true, active: true },
    ];

    const { data, error } = await supabase.from("school_package").insert(packages).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} default school packages`);
    return data;
};

export const createStudentPackages = async (schoolPackageIds: string[]): Promise<any[]> => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const packages = schoolPackageIds.map((pkgId) => ({
        school_package_id: pkgId,
        referral_id: null as any,
        wallet_id: crypto.randomUUID(),
        requested_date_start: startDate.toISOString().split("T")[0],
        requested_date_end: endDate.toISOString().split("T")[0],
        status: "accepted",
    }));

    const { data, error } = await supabase.from("student_package").insert(packages).select();
    if (error) throw error;
    console.log(`✅ Created ${data.length} student packages`);
    return data;
};
