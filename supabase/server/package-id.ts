"use server";

import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { PackageData, PackageUpdateForm, PackageRelations } from "@/backend/data/BookingData"; // Actually PackageData
import { SchoolPackage } from "@/supabase/db/types";
import { revalidatePath } from "next/cache";
import { handleSupabaseError, safeArray } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

/**
 * Updates specific boolean configuration flags for a package.
 */
export async function updatePackageConfig(
    id: string,
    updates: { active?: boolean; is_public?: boolean },
): Promise<{ success: boolean; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) return { success: false, error: "School context not found" };

        const supabase = getServerConnection();
        const { error } = await supabase.from("school_package").update(updates).eq("id", id).eq("school_id", schoolHeader.id);

        if (error) {
            return handleSupabaseError(error, "update package config", "Update failed");
        }

        logger.info("Updated package config", { packageId: id, updates });
        revalidatePath("/packages");
        return { success: true };
    } catch (error) {
        logger.error("Error updating package config", error);
        return { success: false, error: "Update failed" };
    }
}

/**
 * Fetches a school package by ID with all relations mapped to PackageData interface.
 */
export async function getPackageId(id: string): Promise<{ success: boolean; data?: PackageData; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        const supabase = getServerConnection();

        // Fetch package with peer relations: student_package (requests) and booking
        // Note: booking and student_package are peers under school_package
        const { data: pkg, error: pkgError } = await supabase
            .from("school_package")
            .select(
                `
                *,
                student_package(
                    *,
                    referral(*)
                ),
                booking(
                    *,
                    booking_student(
                        student(*)
                    ),
                    lesson(
                        *,
                        teacher(id, username, first_name, last_name),
                        event(*)
                    )
                )
            `,
            )
            .eq("id", id)
            .eq("school_id", schoolHeader.id)
            .single();

        if (pkgError || !pkg) {
            return handleSupabaseError(pkgError, "fetch package details", "Package not found");
        }

        // Map Relations
        const relations: PackageRelations = {
            requests: safeArray(pkg.student_package).map((rp: any) => ({
                ...rp,
                referral: rp.referral,
                bookings: [], // Bookings are not directly linked to requests in schema
            })),
            bookings: safeArray(pkg.booking).map((b: any) => ({
                ...b,
                students: safeArray(b.booking_student).map((bs: any) => bs.student).filter(Boolean),
            })),
        };

        const schema: SchoolPackage = {
            id: pkg.id,
            duration_minutes: pkg.duration_minutes,
            description: pkg.description,
            price_per_student: pkg.price_per_student,
            capacity_students: pkg.capacity_students,
            capacity_equipment: pkg.capacity_equipment,
            category_equipment: pkg.category_equipment,
            package_type: pkg.package_type,
            school_id: pkg.school_id,
            is_public: pkg.is_public,
            active: pkg.active,
            created_at: pkg.created_at,
            updated_at: pkg.updated_at,
        };

        const updateForm: PackageUpdateForm = { ...schema };

        const packageData: PackageData = {
            schema,
            updateForm,
            relations,
        };

        logger.debug("Fetched package details", { packageId: id, schoolId: schoolHeader.id });
        return { success: true, data: packageData };
    } catch (error) {
        logger.error("Error fetching package details", error);
        return { success: false, error: "Failed to fetch package" };
    }
}
