"use server";

import { getServerConnection } from "@/supabase/connection";
import { headers } from "next/headers";
import type { TeacherTableData, TeacherWithLessonsAndPayments, LessonWithPayments } from "@/config/tables";
import { calculateTeacherStats } from "@/backend/data/TeacherData";
import { getTeacherEventsRPC } from "@/supabase/rpc/teacher_events";
import type { ApiActionResponseModel } from "@/types/actions";
import { handleSupabaseError, safeArray } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

export interface TeacherProvider {
    schema: {
        id: string;
        username: string;
        first_name: string;
        last_name: string;
        passport: string;
        country: string;
        phone: string;
        languages: string[];
        active: boolean;
        commissions: {
            id: string;
            commissionType: string;
            cph: string;
            description: string | null;
        }[];
    };
    lessonStats: {
        totalLessons: number;
        completedLessons: number;
    };
}

export async function getSchoolTeacherProvider(): Promise<{ success: boolean; data?: TeacherProvider[]; error?: string }> {
    try {
        const headersList = await headers();
        const schoolId = headersList.get("x-school-id");

        if (!schoolId) {
            return { success: false, error: "School ID not found" };
        }

        const supabase = getServerConnection();

        // Optimized query for provider usage
        const { data, error } = await supabase
            .from("teacher")
            .select(
                `
                id,
                username,
                first_name,
                last_name,
                passport,
                country,
                phone,
                languages,
                active,
                teacher_commission (
                    id,
                    commission_type,
                    cph,
                    description
                ),
                lesson (
                    status
                )
            `,
            )
            .eq("school_id", schoolId)
            .order("username", { ascending: true });

        if (error) {
            return handleSupabaseError(error, "fetch teachers provider", "Failed to fetch teachers");
        }

        const teachers = safeArray(data).map((t: any) => {
            const lessons = t.lesson || [];
            const totalLessons = lessons.length;
            const completedLessons = lessons.filter((l: any) => l.status === "completed" || l.status === "uncompleted").length;

            return {
                schema: {
                    id: t.id,
                    username: t.username,
                    first_name: t.first_name,
                    last_name: t.last_name,
                    passport: t.passport,
                    country: t.country,
                    phone: t.phone,
                    languages: t.languages,
                    active: t.active,
                    commissions: (t.teacher_commission || []).map((c: any) => ({
                        id: c.id,
                        commissionType: c.commission_type,
                        cph: c.cph,
                        description: c.description,
                    })),
                },
                lessonStats: {
                    totalLessons,
                    completedLessons,
                },
            };
        });

        logger.debug("Fetched teachers provider", { schoolId, count: teachers.length });
        return { success: true, data: teachers };
    } catch (error) {
        logger.error("Error fetching teachers provider", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function getTeachersTable(): Promise<TeacherTableData[]> {
    try {
        const headersList = await headers();
        const schoolId = headersList.get("x-school-id");

        if (!schoolId) {
            return [];
        }

        const supabase = getServerConnection();

        // Fetch teachers with their commissions, lessons (for stats), and assigned equipment
        const { data, error } = await supabase
            .from("teacher")
            .select(
                `
                *,
                teacher_commission (
                    id,
                    commission_type,
                    cph,
                    description,
                    active
                ),
                lesson (
                    id,
                    status,
                    created_at,
                    booking!inner(
                        id,
                        leader_student_name,
                        school_package!inner(
                            price_per_student,
                            duration_minutes,
                            capacity_students,
                            category_equipment
                        )
                    ),
                    teacher_commission!inner(
                        cph,
                        commission_type
                    ),
                    event (
                        duration,
                        status
                    ),
                    teacher_lesson_payment (
                        amount
                    )
                ),
                teacher_equipment (
                    active,
                    equipment (
                        id,
                        model,
                        brand,
                        size,
                        category
                    )
                )
            `,
            )
            .eq("school_id", schoolId)
            .order("created_at", { ascending: false });

        if (error) {
            logger.error("Error fetching teachers table", error);
            return [];
        }

        const result = safeArray(data).map((t: any) => {
            const lessons: LessonWithPayments[] = (t.lesson || []).map((l: any) => {
                const totalDuration = l.event.reduce((sum: number, e: any) => sum + (e.duration || 0), 0);
                const recordedPayments = (l.teacher_lesson_payment || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
                const booking = l.booking;
                const pkg = booking.school_package;

                const pricePerHourPerStudent = pkg.duration_minutes > 0 ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0;
                const studentCount = pkg.capacity_students || 1;
                const lessonRevenue = pricePerHourPerStudent * (totalDuration / 60) * studentCount;

                return {
                    id: l.id,
                    teacherId: t.id,
                    teacherUsername: t.username,
                    status: l.status,
                    commission: {
                        type: l.teacher_commission.commission_type as "fixed" | "percentage",
                        cph: l.teacher_commission.cph,
                    },
                    events: {
                        totalCount: l.event.length,
                        totalDuration: totalDuration,
                        details: l.event.map((e: any) => ({ status: e.status, duration: e.duration || 0 })),
                    },
                    teacherPayments: recordedPayments,
                    dateCreated: l.created_at,
                    category: pkg.category_equipment,
                    lessonRevenue,
                    leaderStudentName: booking.leader_student_name,
                    capacityStudents: pkg.capacity_students,
                    bookingId: booking.id,
                };
            });

            // Activity Stats by category - Only COMPLETED or UNCOMPLETED
            const activityStats: Record<string, { count: number; durationMinutes: number }> = {};
            lessons.forEach((l) => {
                if (l.status === "completed" || l.status === "uncompleted") {
                    const category = l.category;
                    if (!activityStats[category]) {
                        activityStats[category] = { count: 0, durationMinutes: 0 };
                    }
                    activityStats[category].count += 1;
                    activityStats[category].durationMinutes += l.events.totalDuration;
                }
            });

            // Map assigned equipment
            const equipments = (t.teacher_equipment || [])
                .filter((te: any) => te.active && te.equipment)
                .map((te: any) => ({
                    id: te.equipment.id,
                    model: te.equipment.model,
                    brand: te.equipment.brand,
                    size: te.equipment.size ? parseFloat(te.equipment.size) : null,
                    category: te.equipment.category,
                }));

            const tableResult: TeacherWithLessonsAndPayments = {
                id: t.id,
                username: t.username,
                firstName: t.first_name,
                lastName: t.last_name,
                passport: t.passport,
                country: t.country,
                phone: t.phone,
                languages: t.languages,
                active: t.active,
                createdAt: t.created_at,
                lessons,
                equipments,
                activityStats,
            };

            const stats = calculateTeacherStats(tableResult);

            return {
                ...tableResult,
                stats,
            };
        });

        logger.debug("Fetched teachers table", { schoolId, count: result.length });
        return result;
    } catch (error) {
        logger.error("Error fetching teachers table", error);
        return [];
    }
}

export async function updateTeacherActive(teacherId: string, active: boolean): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = getServerConnection();

        const { error } = await supabase.from("teacher").update({ active }).eq("id", teacherId);

        if (error) {
            return handleSupabaseError(error, "update teacher status", "Failed to update teacher status");
        }

        logger.info("Updated teacher active status", { teacherId, active });
        return { success: true };
    } catch (error) {
        logger.error("Error updating teacher status", error);
        return { success: false, error: "Failed to update teacher status" };
    }
}

export async function getTeacherEvents(teacherId: string, schoolId?: string): Promise<ApiActionResponseModel<any[]>> {
    try {
        const supabase = getServerConnection();
        const events = await getTeacherEventsRPC(supabase, teacherId, schoolId);

        const mappedEvents = safeArray(events).map((e) => ({
            id: e.event_id,
            date: e.event_date,
            duration: e.event_duration,
            location: e.event_location,
            status: e.event_status,
            booking: {
                id: e.booking_id,
                leaderStudentName: e.leader_student_name,
            },
            students: e.students_json,
            studentCount: e.student_count,
            schoolPackage: {
                id: e.package_id,
                description: e.package_description,
                durationMinutes: e.package_duration_minutes,
                pricePerStudent: e.package_price_per_student,
                categoryEquipment: e.package_category_equipment,
                capacityEquipment: e.package_capacity_equipment,
                capacityStudents: e.package_capacity_students,
            },
            lesson: {
                commission: {
                    id: e.commission_id,
                    commissionType: e.commission_type,
                    cph: e.commission_cph,
                },
            },
        }));

        logger.debug("Fetched teacher events", { teacherId, eventCount: mappedEvents.length });
        return { success: true, data: mappedEvents };
    } catch (error) {
        logger.error("Error fetching teacher events", error);
        return { success: false, error: "Failed to fetch teacher events" };
    }
}
