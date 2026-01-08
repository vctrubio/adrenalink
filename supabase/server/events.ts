"use server";

/**
 * Event Server Actions
 * 
 * All server-side operations related to events are defined here.
 * This includes updating event status, fetching event data, and other event mutations.
 * 
 * These are used by client components (like EventHomeStatusLabel) for optimistic updates
 * and real-time synchronization with the database.
 */

import { getServerConnection } from "@/supabase/connection";
import type { EventStatus } from "@/types/status";
import { getSchoolHeader } from "@/types/headers";
import { convertUTCToSchoolTimezone } from "@/getters/timezone-getter";
import type { TransactionEventData } from "@/types/transaction-event";
import { calculateLessonRevenue, calculateCommission } from "@/getters/commission-calculator";

interface UpdateEventStatusResult {
    success: boolean;
    error?: string;
    data?: {
        id: string;
        status: EventStatus;
    };
}

/**
 * Update an event's status
 * Called from client-side components with optimistic updates
 */
export async function updateEventIdStatus(eventId: string, newStatus: EventStatus): Promise<UpdateEventStatusResult> {
    try {
        const supabase = getServerConnection();

        const { data, error } = await supabase
            .from("event")
            .update({ status: newStatus })
            .eq("id", eventId)
            .select("id, status")
            .single();

        if (error) {
            console.error("Error updating event status:", error);
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data: {
                id: data.id,
                status: data.status as EventStatus,
            },
        };
    } catch (error) {
        console.error("Unexpected error updating event status:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update event status",
        };
    }
}

/**
 * Fetches a complete event transaction with all nested relations
 * Returns formatted TransactionEventData for table and page consumption
 */
export async function getEventTransaction(eventId: string): Promise<{ success: boolean; data?: TransactionEventData; error?: string }> {
    try {
        const supabase = getServerConnection();
        const schoolHeader = await getSchoolHeader();

        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        const { data, error } = await supabase
            .from("event")
            .select(`
                id,
                lesson_id,
                date,
                duration,
                location,
                status,
                lesson!inner(
                    id,
                    teacher_id,
                    status,
                    teacher!inner(
                        id,
                        first_name,
                        last_name,
                        username,
                        school_id,
                        school!inner(
                            id,
                            name,
                            username,
                            currency
                        )
                    ),
                    teacher_commission!inner(
                        id,
                        cph,
                        commission_type,
                        description
                    ),
                    booking!inner(
                        id,
                        date_start,
                        date_end,
                        leader_student_name,
                        status,
                        school_package!inner(
                            id,
                            duration_minutes,
                            description,
                            price_per_student,
                            category_equipment,
                            capacity_equipment,
                            capacity_students,
                            package_type
                        ),
                        booking_student!inner(
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
                        )
                    )
                ),
                equipment_event(
                    equipment_id,
                    equipment(
                        id,
                        sku,
                        brand,
                        model,
                        color,
                        size,
                        category,
                        status
                    )
                )
            `)
            .eq("id", eventId)
            .single();

        if (error || !data) {
            console.error("[EVENT] Error fetching event transaction:", error);
            return { success: false, error: "Event not found" };
        }

        const lesson = data.lesson as any;
        const booking = lesson.booking;
        const pkg = booking.school_package;
        const teacher = lesson.teacher;
        const commission = lesson.teacher_commission;
        const students = booking.booking_student.map((bs: any) => bs.student);
        const equipments = data.equipment_event?.map((ee: any) => ee.equipment) || [];

        // Financial Calculations
        const studentCount = students.length;
        const studentNames = students.map((s: any) => `${s.first_name} ${s.last_name}`);
        const commissionType = (commission.commission_type as "fixed" | "percentage") || "fixed";
        const commissionValue = parseFloat(commission.cph || "0");
        const currency = teacher.school?.currency || "YEN";

        const studentRevenue = pkg ? calculateLessonRevenue(pkg.price_per_student, studentCount, data.duration, pkg.duration_minutes) : 0;
        const commCalc = calculateCommission(data.duration, { type: commissionType, cph: commissionValue }, studentRevenue, pkg?.duration_minutes || 60);
        const teacherEarnings = commCalc.earned;
        const profit = studentRevenue - teacherEarnings;

        // Timezone conversion
        const convertedDate = convertUTCToSchoolTimezone(new Date(data.date), schoolHeader.zone);

        const transactionData: TransactionEventData = {
            event: {
                id: data.id,
                date: convertedDate.toISOString(),
                duration: data.duration,
                location: data.location,
                status: data.status,
            },
            teacher: {
                username: teacher.username,
            },
            leaderStudentName: booking.leader_student_name || "Unknown",
            studentCount,
            studentNames,
            packageData: {
                description: pkg?.description || "Unknown",
                pricePerStudent: pkg?.price_per_student || 0,
                durationMinutes: pkg?.duration_minutes || 60,
                categoryEquipment: pkg?.category_equipment || "",
                capacityEquipment: pkg?.capacity_equipment || 0,
                capacityStudents: pkg?.capacity_students || 0,
            },
            financials: {
                teacherEarnings,
                studentRevenue,
                profit,
                currency,
                commissionType,
                commissionValue,
            },
            equipments: equipments.map((e: any) => ({
                id: e.id,
                brand: e.brand,
                model: e.model,
                size: e.size ? parseFloat(e.size) : null,
            })),
        };

        return { success: true, data: transactionData };
    } catch (error) {
        console.error("[EVENT] Error fetching event transaction:", error);
        return { success: false, error: "Failed to fetch data" };
    }
}
