import { getServerConnection } from "@/supabase/connection";
import { headers } from "next/headers";

export interface TeacherTableData {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    country: string;
    phone: string;
    languages: string[];
    active: boolean;
    commissions: {
        id: string;
        type: "fixed" | "percentage";
        cph: string;
        description: string | null;
    }[];
    activityStats: Record<string, { count: number; durationMinutes: number }>;
    lessonStats: {
        totalLessons: number;
        plannedLessons: number;
    };
    financialStats: {
        totalPayments: number;
        totalCommissions: number;
    };
    equipments: {
        id: string;
        model: string;
        brand: string;
        size: number | null;
        category: string;
    }[];
}

export interface TeacherProvider {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    active: boolean;
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
                id: t.id,
                username: t.username,
                firstName: t.first_name,
                lastName: t.last_name,
                active: t.active,
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
                    booking!inner(
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
                        duration
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
            // Filter active commissions (available for future lessons)
            const activeCommissions = (t.teacher_commission || [])
                .filter((c: any) => c.active)
                .map((c: any) => ({
                    id: c.id,
                    type: c.commission_type as "fixed" | "percentage",
                    cph: c.cph,
                    description: c.description,
                }));

            // Activity and Financial Stats
            const activityStats: Record<string, { count: number; durationMinutes: number }> = {};
            let totalPayments = 0;
            let totalCommissions = 0;
            let plannedLessons = 0;

            const lessons = t.lesson || [];
            const totalLessons = lessons.length;

            lessons.forEach((l: any) => {
                if (l.status === "planned" || l.status === "active") {
                    plannedLessons += 1;
                }
                const events = l.event || [];
                const lessonDurationMinutes = events.reduce((sum: number, e: any) => sum + (e.duration || 0), 0);
                
                // Aggregate activity stats by category
                const pkg = l.booking.school_package;
                const category = pkg.category_equipment;
                
                if (!activityStats[category]) {
                    activityStats[category] = { count: 0, durationMinutes: 0 };
                }
                
                // Count lessons instead of events
                activityStats[category].count += 1;
                activityStats[category].durationMinutes += lessonDurationMinutes;

                // Actual Payments
                const recordedPayments = l.teacher_lesson_payment.reduce((sum: number, p: any) => sum + p.amount, 0);
                totalPayments += recordedPayments;

                // Calculated Commission (Liability)
                const studentCount = pkg.capacity_students || 1;
                const pricePerHourPerStudent = (pkg.duration_minutes > 0) ? pkg.price_per_student / (pkg.duration_minutes / 60) : 0;
                
                const totalDurationHours = lessonDurationMinutes / 60;
                const cph = parseFloat(l.teacher_commission.cph || "0");
                const type = l.teacher_commission.commission_type;
                
                let calculatedComm = 0;
                if (type === "fixed") {
                    calculatedComm = cph * totalDurationHours;
                } else if (type === "percentage") {
                    const lessonRevenue = pricePerHourPerStudent * totalDurationHours * studentCount;
                    calculatedComm = lessonRevenue * (cph / 100);
                }
                totalCommissions += calculatedComm;
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

            return {
                id: t.id,
                firstName: t.first_name,
                lastName: t.last_name,
                username: t.username,
                country: t.country,
                phone: t.phone,
                languages: t.languages,
                active: t.active,
                commissions: activeCommissions,
                activityStats,
                lessonStats: {
                    totalLessons,
                    plannedLessons,
                },
                financialStats: {
                    totalPayments,
                    totalCommissions,
                },
                equipments,
            };
        });
    } catch (error) {
        console.error("Unexpected error in getTeachersTable:", error);
        return [];
    }
}