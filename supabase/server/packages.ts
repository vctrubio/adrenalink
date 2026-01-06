import { getServerConnection } from "@/supabase/connection";
import { headers } from "next/headers";

export interface PackageTableData {
    id: string;
    description: string;
    pricePerStudent: number;
    durationMinutes: number;
    capacityStudents: number;
    capacityEquipment: number;
    categoryEquipment: string;
    packageType: string;
    isPublic: boolean;
    active: boolean;
    usageStats: {
        bookingCount: number;
    };
}

export async function getPackagesTable(): Promise<PackageTableData[]> {
    try {
        const headersList = await headers();
        const schoolId = headersList.get("x-school-id");

        if (!schoolId) {
            console.error("❌ No school ID found in headers");
            return [];
        }

        const supabase = getServerConnection();

        const { data, error } = await supabase
            .from("school_package")
            .select(`
                *,
                booking(count)
            `)
            .eq("school_id", schoolId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching packages table:", error);
            return [];
        }

        return data.map((pkg: any) => ({
            id: pkg.id,
            description: pkg.description,
            pricePerStudent: pkg.price_per_student,
            durationMinutes: pkg.duration_minutes,
            capacityStudents: pkg.capacity_students,
            capacityEquipment: pkg.capacity_equipment,
            categoryEquipment: pkg.category_equipment,
            packageType: pkg.package_type,
            isPublic: pkg.is_public,
            active: pkg.active,
            usageStats: {
                bookingCount: pkg.booking?.[0]?.count || 0,
            },
        }));
    } catch (error) {
        console.error("Unexpected error in getPackagesTable:", error);
        return [];
    }
}