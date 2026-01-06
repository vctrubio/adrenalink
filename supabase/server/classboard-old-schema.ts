"use server";

import { getServerConnection } from "../connection";
import { getSchoolHeader } from "@/types/headers";
import { convertUTCToSchoolTimezone } from "@/getters/timezone-getter";
import { createClassboardModel } from "@/getters/classboard-getter";
import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";
import type { ApiActionResponseModel } from "@/types/actions";

// Use Supabase exclusively for classboard to avoid mixing Drizzle + Supabase
// This ensures consistent connection pooling and row-level security
const getSupabase = () => getServerConnection();

/**
 * Shared query builder for booking relations
 * Reduces duplication between single and multiple booking queries
 */
function buildBookingQuery() {
    return `
        id,
        date_start,
        date_end,
        school_id,
        leader_student_name,
        student_package_id,
        student_package!inner(
            id,
            school_package_id,
            school_package!inner(
                id,
                duration_minutes,
                description,
                price_per_student,
                capacity_students,
                capacity_equipment,
                category_equipment
            )
        ),
        booking_student!inner(
            id,
            student_id,
            student!inner(
                id,
                first_name,
                last_name,
                passport,
                country,
                phone,
                languages
            )
        ),
        lesson!inner(
            id,
            teacher_id,
            status,
            teacher!inner(
                id,
                first_name,
                last_name,
                username
            ),
            teacher_commission!inner(
                id,
                cph,
                commission_type,
                description
            ),
            event!inner(
                id,
                lesson_id,
                date,
                duration,
                location,
                status
            )
        )
    `;
}

/**
 * Fetches all classboard bookings for a school
 * Used for initial page load to populate the entire classboard
 */
export async function getSQLClassboardData(): Promise<ApiActionResponseModel<ClassboardModel>> {
    try {
        const schoolHeader = await getSchoolHeader();

        if (!schoolHeader) {
            return {
                success: false,
                error: "School context could not be determined from header. The school may not exist or is not configured correctly.",
            };
        }

        const supabase = getSupabase();

        // Fetch all bookings with full nested relations
        const { data: bookingsResult, error } = await supabase
            .from("booking")
            .select(buildBookingQuery())
            .eq("school_id", schoolHeader.id)
            .order("date_start", { ascending: false });

        if (error) {
            console.error("[CLASSBOARD] Error fetching bookings:", error);
            return { success: false, error: "Failed to fetch classboard data" };
        }

        // Data is already properly structured - no merging needed
        const classboardData: ClassboardModel = createClassboardModel(bookingsResult || []);

        // Convert all event times from UTC to school's local timezone for display
        classboardData.forEach((bookingData) => {
            bookingData.lessons?.forEach((lessonData) => {
                lessonData.events?.forEach((evt) => {
                    const convertedDate = convertUTCToSchoolTimezone(new Date(evt.date), schoolHeader.zone);
                    evt.date = convertedDate.toISOString();
                });
            });
        });

        return { success: true, data: classboardData };
    } catch (error) {
        return {
            success: false,
            error: `Failed to fetch classboard data: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

/**
 * Fetches a single booking with all its relations using PostgREST nested queries
 * Returns the full booking with ALL lessons and ALL events (not filtered by date)
 * Used for realtime sync updates
 */
export async function getSQLClassboardDataForBooking(bookingId: string): Promise<ApiActionResponseModel<ClassboardModel>> {
    try {
        const schoolHeader = await getSchoolHeader();

        if (!schoolHeader) {
            return {
                success: false,
                error: "School context could not be determined from header.",
            };
        }

        const supabase = getSupabase();

        // Fetch single booking with full nested relations
        const { data: bookingData, error } = await supabase
            .from("booking")
            .select(buildBookingQuery())
            .eq("id", bookingId)
            .single();

        if (error) {
            console.error("[CLASSBOARD] Error fetching booking:", error);
            return { success: false, error: "Failed to fetch booking data" };
        }

        if (!bookingData) {
            return { success: true, data: [] };
        }

        const classboardData = createClassboardModel([bookingData]);

        // Convert all event times from UTC to school's local timezone for display
        classboardData.forEach((bd) => {
            bd.lessons?.forEach((lessonData) => {
                lessonData.events?.forEach((evt) => {
                    const convertedDate = convertUTCToSchoolTimezone(new Date(evt.date), schoolHeader.zone);
                    evt.date = convertedDate.toISOString();
                });
            });
        });

        return { success: true, data: classboardData };
    } catch (error) {
        return {
            success: false,
            error: `Failed to fetch booking data: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

