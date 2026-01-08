import { getServerConnection } from "@/supabase/connection";
import { headers } from "next/headers";
import type { TeacherTableData, TeacherWithLessonsAndPayments, LessonWithPayments } from "@/config/tables";
import { calculateTeacherStats } from "@/backend/data/TeacherData";

export interface TeacherProvider {
    schema: {
        id: string;
        username: string;
        first_name: string;
        last_name: string;
        active: boolean;
    };
    lessonStats: {
        totalLessons: number;
        completedLessons: number;
    };
}

export async function getSchoolTeacherProvider(): Promise<TeacherProvider[]> {
    try {
        const headersList = await headers();
        const schoolId = headersList.get("x-school-id");

        if (!schoolId) {
            console.error("❌ No school ID found in headers");
            return [];
        }

        const supabase = getServerConnection();

        // Optimized query for provider usage
        const { data, error } = await supabase
            .from("teacher")
            .select(`
                id,
                username,
                first_name,
                last_name,
                active,
                lesson (
                    status
                )
            `)
            .eq("school_id", schoolId)
            .order("username", { ascending: true });

        if (error) {
            console.error("Error fetching teachers provider:", error);
            return [];
        }

        return data.map((t: any) => {
            const lessons = t.lesson || [];
            const totalLessons = lessons.length;
            const completedLessons = lessons.filter((l: any) => l.status === "completed" || l.status === "uncompleted").length;

            return {
                schema: {
                    id: t.id,
                    username: t.username,
                    first_name: t.first_name,
                    last_name: t.last_name,
                    active: t.active,
                },
                lessonStats: {
                    totalLessons,
                    completedLessons,
                }
            };
        });
    } catch (error) {
        console.error("Unexpected error in getSchoolTeacherProvider:", error);
        return [];
    }
}

export async function getTeachersTable(): Promise<TeacherTableData[]> {
    try {
        const headersList = await headers();
        const schoolId = headersList.get("x-school-id");

        if (!schoolId) {
            console.error("❌ No school ID found in headers");
            return [];
        }

        const supabase = getServerConnection();

        // Fetch teachers with their commissions, lessons (for stats), and assigned equipment
        const { data, error } = await supabase
            .from("teacher")
            .select(`
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
            `)
            .eq("school_id", schoolId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching teachers table:", error);
            return [];
        }

        return data.map((t: any) => {
            const lessons: LessonWithPayments[] = (t.lesson || []).map((l: any) => {
                const totalDuration = l.event.reduce((sum: number, e: any) => sum + (e.duration || 0), 0);
                const recordedPayments = (l.teacher_lesson_payment || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
                const booking = l.booking;
                const pkg = booking.school_package;

                const pricePerHourPerStudent = (pkg.duration_minutes > 0) ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0;
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
            lessons.forEach(l => {
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

            const result: TeacherWithLessonsAndPayments = {
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

            const stats = calculateTeacherStats(result);

            return {
                ...result,
                stats
            };
        });
    } catch (error) {
        console.error("Unexpected error in getTeachersTable:", error);
        return [];
    }
}
