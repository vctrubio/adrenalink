/**
 * Admin Home Server Functions
 * School credentials and transaction data for the admin dashboard
 */

import { getServerConnection } from "@/supabase/connection";
import { headers } from "next/headers";
import { createClassboardModel } from "@/getters/classboard-getter";
import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";

/**
 * Query builder for booking with all nested relations
 * Matches the classboard schema structure
 */
function buildBookingQuery() {
    return `
        id,
        date_start,
        date_end,
        school_id,
        leader_student_name,
        school_package_id,
        school_package!inner(
            id,
            duration_minutes,
            description,
            price_per_student,
            capacity_students,
            capacity_equipment,
            category_equipment
        ),
        booking_student(
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
                status,
                equipment_event(
                    equipment(
                        id,
                        brand,
                        model,
                        size
                    )
                )
            )
        )
    `;
}

export async function getHomeBookings(): Promise<ClassboardModel> {
    const headersList = await headers();
    const schoolId = headersList.get("x-school-id");
    
    if (!schoolId) {
        throw new Error("School ID not found in headers");
    }

    const supabase = await getServerConnection();
    
    // Single call: Fetch bookings for this school with all nested relations
    const { data: bookings, error: bookingsError } = await supabase
        .from("booking")
        .select(buildBookingQuery())
        .eq("school_id", schoolId)
        .order("date_start", { ascending: false });

    if (bookingsError) {
        throw new Error(`Failed to fetch bookings: ${bookingsError.message}`);
    }

    // Transform raw booking data into ClassboardModel format
    const classboardData = createClassboardModel(bookings || []);
    
    return classboardData;
}