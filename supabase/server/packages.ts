"use server";

import { revalidatePath } from "next/cache";
import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import type { PackageWithUsageStats, PackageTableData } from "@/config/tables";
import { calculatePackageStats } from "@/backend/data/PackageData";
import { safeArray, handleSupabaseError } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

export async function getPackagesTable(): Promise<PackageTableData[]> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            throw new Error("School context not found");
        }
        const schoolId = schoolHeader.id;

        if (!schoolId) {
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
            logger.error("Error fetching packages table", error);
            return [];
        }

        const result = safeArray(data).map((pkg: any) => {
            const bookingCount = pkg.booking?.[0]?.count || 0;
            const requestCount = pkg.student_package?.[0]?.count || 0;
            const revenue = bookingCount * pkg.price_per_student * pkg.capacity_students;

            const packageResult: PackageWithUsageStats = {
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

            const stats = calculatePackageStats(packageResult);

            return {
                ...packageResult,
                stats,
            };
        });

        logger.debug("Fetched packages table", { schoolId, count: result.length });
        return result;
    } catch (error) {
        logger.error("Error fetching packages table", error);
        return [];
    }
}

export async function updateSchoolPackage(
    packageId: string,
    updateData: {
        description: string;
        is_public: boolean;
        active: boolean;
    },
): Promise<{ success: boolean; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            throw new Error("School context not found");
        }
        const schoolId = schoolHeader.id;

        if (!schoolId) {
            return { success: false, error: "School ID not found" };
        }

        const supabase = getServerConnection();

        // Update package
        const { error } = await supabase
            .from("school_package")
            .update({
                description: updateData.description,
                is_public: updateData.is_public,
                active: updateData.active,
                updated_at: new Date().toISOString(),
            })
            .eq("id", packageId)
            .eq("school_id", schoolId);

        if (error) {
            return handleSupabaseError(error, "update school package", "Failed to update package");
        }

        logger.info("Updated school package", { packageId });
        revalidatePath("/packages");
        revalidatePath(`/packages/${packageId}`);
        return { success: true };
    } catch (error) {
        logger.error("Error updating school package", error);
        return { success: false, error: "Failed to update package" };
    }
}

export async function deleteSchoolPackage(packageId: string): Promise<{ success: boolean; error?: string; canDelete?: boolean }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            throw new Error("School context not found");
        }
        const schoolId = schoolHeader.id;

        if (!schoolId) {
            return { success: false, error: "School ID not found" };
        }

        const supabase = getServerConnection();

        // Check if package has any bookings
        const { data: bookings } = await supabase.from("booking").select("id").eq("school_package_id", packageId).limit(1);

        if (bookings && bookings.length > 0) {
            return {
                success: false,
                canDelete: false,
                error: "Cannot delete package with bookings",
            };
        }

        // Check if package has any student requests
        const { data: requests } = await supabase.from("student_package").select("id").eq("school_package_id", packageId).limit(1);

        if (requests && requests.length > 0) {
            return {
                success: false,
                canDelete: false,
                error: "Cannot delete package with student requests",
            };
        }

        // Delete package
        const { error } = await supabase.from("school_package").delete().eq("id", packageId).eq("school_id", schoolId);

        if (error) {
            return handleSupabaseError(error, "delete school package", "Failed to delete package");
        }

        logger.info("Deleted school package", { packageId });
        revalidatePath("/packages");
        return { success: true, canDelete: true };
    } catch (error) {
        logger.error("Error deleting school package", error);
        return { success: false, error: "Failed to delete package" };
    }
}
