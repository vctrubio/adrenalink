"use server";

import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { BookingData, BookingUpdateForm, BookingRelations } from "@/backend/data/BookingData";
import { Booking } from "@/supabase/db/types";

/**
 * Fetches a booking by ID with all relations mapped to BookingData interface.
 */
export async function getBookingId(id: string): Promise<{ success: boolean; data?: BookingData; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        const supabase = getServerConnection();

        // Fetch booking with core relations
        const { data: booking, error: bookingError } = await supabase
            .from("booking")
            .select(`
                *,
                school_package(*),
                booking_student(
                    student(*)
                ),
                lesson(
                    *,
                    teacher(
                        id,
                        username,
                        first_name,
                        last_name
                    ),
                    event(*)
                ),
                student_booking_payment(
                    *,
                    student(*)
                )
            `)
            .eq("id", id)
            .eq("school_id", schoolHeader.id)
            .single();

        if (bookingError || !booking) {
            console.error("Error fetching booking details:", bookingError);
            return { success: false, error: "Booking not found" };
        }

        // Map Relations
        const relations: BookingRelations = {
            school_package: booking.school_package,
            students: (booking.booking_student || []).map((bs: any) => bs.student).filter(Boolean),
            lessons: (booking.lesson || []).map((l: any) => ({
                ...l,
                teacher: l.teacher,
                events: l.event || [],
            })),
            student_booking_payment: (booking.student_booking_payment || []).map((p: any) => ({
                id: p.id,
                amount: p.amount,
                created_at: p.created_at,
                student_id: p.student_id,
                student_name: p.student ? `${p.student.first_name} ${p.student.last_name}` : "Unknown Student",
            })),
        };

        const schema: Booking = {
            id: booking.id,
            school_id: booking.school_id,
            school_package_id: booking.school_package_id,
            date_start: booking.date_start,
            date_end: booking.date_end,
            leader_student_name: booking.leader_student_name,
            status: booking.status,
            created_at: booking.created_at,
            updated_at: booking.updated_at,
        };

        const updateForm: BookingUpdateForm = { ...schema };

        const bookingData: BookingData = {
            schema,
            updateForm,
            relations,
        };

        return { success: true, data: bookingData };
    } catch (error) {
        console.error("Unexpected error in getBookingId:", error);
        return { success: false, error: "Failed to fetch booking" };
    }
}

/**
 * Updates the status of a booking.
 */
export async function updateBookingStatus(bookingId: string, status: string): Promise<{ success: boolean; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        const supabase = getServerConnection();

        const { error } = await supabase
            .from("booking")
            .update({ status })
            .eq("id", bookingId)
            .eq("school_id", schoolHeader.id);

        if (error) {
            console.error("Error updating booking status:", error);
            return { success: false, error: "Failed to update booking status" };
        }

        return { success: true };
    } catch (error) {
        console.error("Unexpected error in updateBookingStatus:", error);
        return { success: false, error: "Failed to update booking status" };
    }
}