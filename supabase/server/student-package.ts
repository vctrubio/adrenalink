"use server";
import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { StudentPackage, SchoolPackage, Referral } from "@/supabase/db/types";
import { logger } from "@/backend/logger";
import { safeArray } from "@/backend/error-handlers";

export interface StudentPackageRequest extends StudentPackage {
    school_package: SchoolPackage;
    referral?: Referral;
}

/**
 * Fetches student package requests for the current school.
 * Default sorting: newest requests first (by created_at descending).
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
            .order("created_at", { ascending: false }); // Default: newest first

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

        // No revalidation needed - listener will pick up the change automatically
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

        const packagesWithStats = safeArray(data).map((sp: any) => {
            const bookings = safeArray(sp.booking);
            const booking_count = bookings.length;

            let event_count = 0;
            let total_duration_minutes = 0;

            bookings.forEach((b: any) => {
                const lessons = safeArray(b.lesson);
                lessons.forEach((l: any) => {
                    const events = safeArray(l.event);
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

/**
 * Creates a new student package request.
 */
export async function createStudentPackageRequest(params: {
    schoolPackageId: string;
    startDate: string;
    endDate: string;
    clerkId: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const supabase = getServerConnection();

        // Check if student already has a pending or active request for this specific school package
        // (Wait, user didn't ask for this check, but it's good practice. I'll skip for now to keep it simple as requested)

        const { data, error } = await supabase
            .from("student_package")
            .insert({
                school_package_id: params.schoolPackageId,
                requested_date_start: params.startDate,
                requested_date_end: params.endDate,
                requested_clerk_id: params.clerkId,
                status: "requested",
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            logger.error("Error creating student package request", error);
            return { success: false, error: "Failed to submit request" };
        }

        // No revalidation needed - listener will pick up the change automatically
        return { success: true, data };
    } catch (error) {
        logger.error("Unexpected error in createStudentPackageRequest", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}
