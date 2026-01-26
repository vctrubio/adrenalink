"use server";

import { getServerConnection } from "@/supabase/connection";
import { getSchoolHeader } from "@/types/headers";
import { BookingData, BookingUpdateForm, BookingRelations } from "@/backend/data/BookingData";
import { Booking } from "@/supabase/db/types";
import { handleSupabaseError, safeArray } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";
import { lessonsToTransactionEvents, groupTransactionsByLesson } from "@/getters/booking-lesson-event-getter";

/**
 * Fetches a booking by ID with all relations mapped to BookingData interface.
 */
export async function getBookingId(id: string): Promise<{ success: boolean; data?: BookingData; error?: string }> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }
        const schoolId = schoolHeader.id;
        const currency = schoolHeader.currency || "YEN";

        const supabase = getServerConnection();

        // Fetch booking with core relations
        const { data: booking, error: bookingError } = await supabase
            .from("booking")
            .select(
                `
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
                    teacher_commission(
                        id,
                        cph,
                        commission_type,
                        description
                    ),
                    event(
                        *,
                        equipment_event(
                            equipment(
                                id,
                                brand,
                                model,
                                size,
                                sku,
                                color,
                                category
                            )
                        )
                    ),
                    teacher_lesson_payment(*)
                ),
                student_booking_payment(
                    *,
                    student(*)
                )
            `,
            )
            .eq("id", id)
            .eq("school_id", schoolId)
            .single();

        if (bookingError || !booking) {
            return handleSupabaseError(bookingError, "fetch booking details", "Booking not found");
        }

        // Prepare lessons array for unified getters
        const allLessons = safeArray(booking.lesson).map((l: any) => ({
            ...l,
            // Ensure necessary nested relations are directly available for the getter
            teacher: l.teacher,
            teacher_commission: l.teacher_commission,
            booking: { // Simplified booking object for lesson context
                id: booking.id,
                date_start: booking.date_start,
                date_end: booking.date_end,
                leader_student_name: booking.leader_student_name,
                status: booking.status,
                school_package: booking.school_package,
                booking_student: booking.booking_student, // Pass original booking_student for transaction events
            },
            event: safeArray(l.event).map((evt: any) => ({
                ...evt,
                equipment_event: safeArray(evt.equipment_event),
            })),
            teacher_lesson_payment: safeArray(l.teacher_lesson_payment),
        }));

        // Use unified getters to transform data
        const transactions = lessonsToTransactionEvents(allLessons, currency);

        const lessonPaymentsMap: Record<string, number> = {};
        allLessons.forEach((l: any) => {
            lessonPaymentsMap[l.id] = safeArray(l.teacher_lesson_payment).reduce(
                (sum: number, p: any) => sum + (p.amount || 0),
                0
            );
        });
        const lessonRows = groupTransactionsByLesson(transactions, lessonPaymentsMap);

        // Calculate aggregate stats for BookingData
        const totalEventsCount = transactions.length;
        const totalUsedMinutes = transactions.reduce((sum, tx) => sum + tx.event.duration, 0);
        const totalPaidAmount = safeArray(booking.student_booking_payment).reduce((sum, p) => sum + p.amount, 0);
        const totalRevenueFromTransactions = transactions.reduce((sum, tx) => sum + tx.financials.studentRevenue, 0);
        const totalDueAmount = totalRevenueFromTransactions - totalPaidAmount;

        // Map Relations
        const students = safeArray(booking.booking_student).map((bs: any) => bs.student).filter(Boolean);

        const relations: BookingRelations = {
            school_package: booking.school_package,
            students,
            lessons: allLessons, // Keep original lessons data for relations if needed elsewhere
            student_booking_payment: safeArray(booking.student_booking_payment).map((p: any) => ({
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
            transactions,
            lessonRows,
            totalEventsCount,
            totalUsedMinutes,
            totalDueAmount,
        };


        logger.debug("Fetched booking details", { bookingId: id, schoolId, lessonCount: relations.lessons.length });
        return { success: true, data: bookingData };
    } catch (error) {
        logger.error("Error fetching booking details", error);
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

        const { error } = await supabase.from("booking").update({ status }).eq("id", bookingId).eq("school_id", schoolHeader.id);

        if (error) {
            return handleSupabaseError(error, "update booking status", "Failed to update booking status");
        }

        logger.info("Updated booking status", { bookingId, status });
        return { success: true };
    } catch (error) {
        logger.error("Error updating booking status", error);
        return { success: false, error: "Failed to update booking status" };
    }
}