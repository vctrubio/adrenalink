"use server";

import { revalidatePath } from "next/cache";
import { getServerConnection } from "@/supabase/connection";
import { getSchoolId } from "@/backend/school-context";
import type { BookingWithLessonAndPayments, LessonWithPayments, BookingStudentPayments, BookingTableStats } from "@/config/tables";
import { calculateBookingStats } from "@/backend/data/BookingData";
import { safeArray, handleSupabaseError } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

export type BookingTableData = BookingWithLessonAndPayments & { stats: BookingTableStats; currency: string };

export async function getBookingsTable(): Promise<BookingTableData[]> {
    try {
        const schoolId = await getSchoolId();

        if (!schoolId) {
            return [];
        }

        const supabase = getServerConnection();

        const { data, error } = await supabase
            .from("booking")
            .select(
                `
                id,
                date_start,
                date_end,
                leader_student_name,
                status,
                school!inner(currency),
                school_package!inner(
                    description,
                    capacity_students,
                    capacity_equipment,
                    category_equipment,
                    duration_minutes,
                    price_per_student
                ),
                lesson(
                    id,
                    status,
                    teacher!inner(
                        id,
                        username
                    ),
                    teacher_commission!inner(
                        cph,
                        commission_type
                    ),
                    event(
                        duration,
                        status
                    ),
                        teacher_lesson_payment(
                            amount
                        )
                ),
                    student_booking_payment(
                        student_id,
                        amount
                    )
            `,
            )
            .eq("school_id", schoolId)
            .order("date_start", { ascending: false });

        if (error) {
            logger.error("Error fetching bookings table", error);
            return [];
        }

        const result = safeArray(data).map((booking: any) => {
            const pkg = booking.school_package;
            const currency = booking.school?.currency || "EUR";
            const studentCount = pkg.capacity_students || 1;
            const pricePerHourPerStudent = pkg.duration_minutes > 0 ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0;

            const lessons: LessonWithPayments[] = safeArray(booking.lesson).map((l: any) => {
                const totalDuration = safeArray(l.event).reduce((sum: number, e: any) => sum + (e.duration || 0), 0); // minutes
                const totalCount = safeArray(l.event).length;

                const recordedPayments = safeArray(l.teacher_lesson_payment).length > 0
                    ? safeArray(l.teacher_lesson_payment).reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
                    : 0;

                return {
                    id: l.id,
                    teacherId: l.teacher.id,
                    teacherUsername: l.teacher.username,
                    status: l.status,
                    commission: {
                        type: l.teacher_commission.commission_type as "fixed" | "percentage",
                        cph: l.teacher_commission.cph,
                    },
                    events: {
                        totalCount,
                        totalDuration: totalDuration,
                        details: safeArray(l.event).map((e: any) => ({ status: e.status, duration: e.duration || 0 })),
                    },
                    teacherPayments: recordedPayments,
                };
            });

            const payments: BookingStudentPayments[] = safeArray(booking.student_booking_payment)
                .map((p: any) => ({ student_id: p.student_id ?? 0, amount: p.amount }));

            const pkgOut = {
                description: pkg.description,
                categoryEquipment: pkg.category_equipment,
                capacityEquipment: pkg.capacity_equipment,
                capacityStudents: pkg.capacity_students,
                durationMinutes: pkg.duration_minutes,
                pricePerStudent: pkg.price_per_student,
                pph: pricePerHourPerStudent,
            };

            const bookingResult: BookingWithLessonAndPayments = {
                booking: {
                    id: booking.id,
                    dateStart: booking.date_start,
                    dateEnd: booking.date_end,
                    leaderStudentName: booking.leader_student_name,
                    status: booking.status,
                },
                package: pkgOut,
                lessons,
                payments,
            };

            const stats = calculateBookingStats(bookingResult);

            return {
                ...bookingResult,
                stats,
                currency,
            };
        });

        logger.debug("Fetched bookings table", { schoolId, count: result.length });
        return result;
    } catch (error) {
        logger.error("Error fetching bookings table", error);
        return [];
    }
}

export async function updateBooking(
    bookingId: string,
    updateData: {
        date_start: string;
        date_end: string;
        leader_student_name: string;
        status: string;
    },
): Promise<{ success: boolean; error?: string }> {
    try {
        const schoolId = await getSchoolId();

        if (!schoolId) {
            return { success: false, error: "School ID not found" };
        }

        const supabase = getServerConnection();

        // Update booking
        const { error } = await supabase
            .from("booking")
            .update({
                date_start: updateData.date_start,
                date_end: updateData.date_end,
                leader_student_name: updateData.leader_student_name,
                status: updateData.status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", bookingId)
            .eq("school_id", schoolId);

        if (error) {
            return handleSupabaseError(error, "update booking", "Failed to update booking");
        }

        logger.info("Updated booking", { bookingId });
        revalidatePath("/bookings");
        revalidatePath(`/bookings/${bookingId}`);
        return { success: true };
    } catch (error) {
        logger.error("Error updating booking", error);
        return { success: false, error: "Failed to update booking" };
    }
}

export async function deleteBooking(bookingId: string): Promise<{ success: boolean; error?: string; canDelete?: boolean }> {
    try {
        const schoolId = await getSchoolId();

        if (!schoolId) {
            return { success: false, error: "School ID not found" };
        }

        const supabase = getServerConnection();

        // Check if booking has any lessons with events
        const { data: lessons } = await supabase
            .from("lesson")
            .select("id, event(id)")
            .eq("booking_id", bookingId)
            .limit(1);

        if (lessons && lessons.length > 0) {
            const hasEvents = lessons.some((lesson: any) => lesson.event && lesson.event.length > 0);
            if (hasEvents) {
                return {
                    success: false,
                    canDelete: false,
                    error: "Cannot delete booking with lessons that have events",
                };
            }
        }

        // Delete the lesson if it exists (no events)
        if (lessons && lessons.length > 0) {
            const { error: lessonDeleteError } = await supabase.from("lesson").delete().eq("booking_id", bookingId);

            if (lessonDeleteError) {
                return handleSupabaseError(lessonDeleteError, "delete lesson", "Failed to delete associated lesson");
            }
        }

        // Delete booking (cascade will handle booking_student and payments)
        const { error } = await supabase.from("booking").delete().eq("id", bookingId).eq("school_id", schoolId);

        if (error) {
            return handleSupabaseError(error, "delete booking", "Failed to delete booking");
        }

        logger.info("Deleted booking", { bookingId });
        revalidatePath("/bookings");
        return { success: true, canDelete: true };
    } catch (error) {
        logger.error("Error deleting booking", error);
        return { success: false, error: "Failed to delete booking" };
    }
}
