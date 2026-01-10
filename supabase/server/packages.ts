import { getServerConnection } from "@/supabase/connection";
import { headers } from "next/headers";
import type { PackageWithUsageStats, PackageTableData } from "@/config/tables";
import { calculatePackageStats } from "@/backend/data/PackageData";

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
            .select(
                `
                *,
                booking(count),
                student_package(count)
            `,
            )
            .eq("school_id", schoolId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching packages table:", error);
            return [];
        }

        return data.map((pkg: any) => {
            const bookingCount = pkg.booking?.[0]?.count || 0;
            const requestCount = pkg.student_package?.[0]?.count || 0;
            const revenue = bookingCount * pkg.price_per_student * pkg.capacity_students;

            const result: PackageWithUsageStats = {
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
                createdAt: pkg.created_at,
                usageStats: {
                    bookingCount,
                    requestCount,
                    revenue,
                },
            };

            const stats = calculatePackageStats(result);

            return {
                ...result,
                stats,
            };
        });
    } catch (error) {
        console.error("Unexpected error in getPackagesTable:", error);
        return [];
    }
}
