"use server";
import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { StudentPackage, SchoolPackage, Referral } from "@/supabase/db/types";
import { revalidatePath } from "next/cache";
import { logger } from "@/backend/logger";

export interface StudentPackageRequest extends StudentPackage {
    school_package: SchoolPackage;
    referral?: Referral;
}

/**
 * Fetches student package requests for the current school.
 */
export async function getStudentPackageRequests(): Promise<{ success: boolean; data?: StudentPackageRequest[]; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        const supabase = getServerConnection();

        const { data, error } = await supabase
            .from("student_package")
            .select(
                `
                *,
                school_package!inner(*),
                referral(*)
            `,
            )
            .eq("school_package.school_id", schoolHeader.id)
            .order("created_at", { ascending: false });

        if (error) {
            logger.error("Error fetching student package requests", error);
            return { success: false, error: "Failed to fetch requests" };
        }

        return { success: true, data: data as StudentPackageRequest[] };
    } catch (error) {
        logger.error("Unexpected error in getStudentPackageRequests", error);
        return { success: false, error: "Failed to fetch requests" };
    }
}

/**
 * Updates the status of a student package request.
 */
export async function updateStudentPackageStatus(id: string, status: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = getServerConnection();

        const { error } = await supabase
            .from("student_package")
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) {
            logger.error("Error updating student package status", error);
            return { success: false, error: "Failed to update status" };
        }

        revalidatePath("/invitations");
        revalidatePath("/packages");
        revalidatePath("/students");

        return { success: true };
    } catch (error) {
        logger.error("Unexpected error in updateStudentPackageStatus", error);
        return { success: false, error: "Failed to update status" };
    }
}

/**
 * Interface for student package with usage stats
 */
export interface StudentPackageWithStats extends StudentPackageRequest {
    usage_stats: {
        booking_count: number;
        event_count: number;
        total_duration_minutes: number;
        total_revenue: number;
    };
}

/**
 * Fetches all student packages for a school with calculated usage stats.
 */
export async function getStudentPackagesWithStats(): Promise<{ success: boolean; data?: StudentPackageWithStats[]; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        const supabase = getServerConnection();

        // Fetch student packages with their bookings, lessons, and events
        const { data, error } = await supabase
            .from("student_package")
            .select(
                `
                *,
                school_package!inner(*),
                referral(*),
                booking(
                    id,
                    lesson(
                        duration,
                        event(duration)
                    )
                )
            `,
            )
            .eq("school_package.school_id", schoolHeader.id)
            .order("created_at", { ascending: false });

        if (error) {
            logger.error("Error fetching student packages with stats", error);
            return { success: false, error: "Failed to fetch packages" };
        }

        const packagesWithStats = (data || []).map((sp: any) => {
            const bookings = sp.booking || [];
            const booking_count = bookings.length;

            let event_count = 0;
            let total_duration_minutes = 0;

            bookings.forEach((b: any) => {
                const lessons = b.lesson || [];
                lessons.forEach((l: any) => {
                    const events = l.event || [];
                    event_count += events.length;
                    total_duration_minutes += events.reduce((sum: number, e: any) => sum + (e.duration || 0), 0);
                });
            });

            const pkg = sp.school_package;
            const price_per_minute = pkg.duration_minutes > 0 ? pkg.price_per_student / pkg.duration_minutes : 0;
            const total_revenue = price_per_minute * total_duration_minutes * (pkg.capacity_students || 1);

            return {
                ...sp,
                usage_stats: {
                    booking_count,
                    event_count,
                    total_duration_minutes,
                    total_revenue,
                },
            } as StudentPackageWithStats;
        });

        return { success: true, data: packagesWithStats };
    } catch (error) {
        logger.error("Unexpected error in getStudentPackagesWithStats", error);
        return { success: false, error: "Failed to fetch packages" };
    }
}
