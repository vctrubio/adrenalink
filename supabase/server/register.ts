import { supabase } from "./index";

// Types for register tables
export interface RegisterPackage {
    id: string;
    durationMinutes: number;
    description: string | null;
    pricePerStudent: number;
    capacityStudents: number;
    capacityEquipment: number;
    categoryEquipment: string;
    packageType: string;
    isPublic: boolean;
    active: boolean;
}

export interface RegisterStudent {
    id: string;
    firstName: string;
    lastName: string;
    passport: string;
    country: string;
    phone: string;
    languages: string[];
}

export interface RegisterSchoolStudent {
    id: string;
    studentId: string;
    description: string | null;
    active: boolean;
    rental: boolean;
    student: RegisterStudent;
}

export interface RegisterCommission {
    id: string;
    teacherId: string;
    commissionType: string;
    description: string | null;
    cph: string;
    active: boolean;
}

export interface RegisterTeacher {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    passport: string;
    country: string;
    phone: string;
    languages: string[];
    schoolId: string;
    active: boolean;
    commissions: RegisterCommission[];
}

export interface RegisterReferral {
    id: string;
    code: string;
    description: string | null;
    commissionType: string;
    commissionValue: string;
    active: boolean;
}

export interface StudentBookingTableStats {
    bookingCount: number;
    durationHours: number;
    allBookingsCompleted: boolean;
}

export interface TeacherLessonTableStats {
    totalLessons: number;
    plannedLessons: number;
}

export interface RegisterTables {
    school: { id: string; name: string; username: string };
    packages: RegisterPackage[];
    students: RegisterSchoolStudent[];
    teachers: RegisterTeacher[];
    referrals: RegisterReferral[];
    studentBookingStats: Record<string, StudentBookingTableStats>;
    teacherLessonStats: Record<string, TeacherLessonTableStats>;
}

/**
 * Fetch all register page data using optimized parallel SQL queries
 */
export async function getRegisterTables(
    schoolId: string,
    schoolName: string,
    schoolUsername: string
): Promise<{ success: true; data: RegisterTables } | { success: false; error: string }> {
    try {
        // Run all queries in parallel for maximum performance
        const [packagesResult, studentsResult, teachersResult, referralsResult, bookingsResult, lessonsResult] =
            await Promise.all([
                // 1. Packages
                supabase
                    .from("school_package")
                    .select("id, duration_minutes, description, price_per_student, capacity_students, capacity_equipment, category_equipment, package_type, is_public, active")
                    .eq("school_id", schoolId)
                    .eq("active", true)
                    .order("package_type", { ascending: true })
                    .order("capacity_students", { ascending: true }),

                // 2. Students - join school_students with student
                supabase
                    .from("school_students")
                    .select("id, student_id, description, active, rental, student(id, first_name, last_name, passport, country, phone, languages)")
                    .eq("school_id", schoolId)
                    .eq("active", true),

                // 3. Teachers with their active commissions
                supabase
                    .from("teacher")
                    .select("id, first_name, last_name, username, passport, country, phone, languages, school_id, active, teacher_commission(id, teacher_id, commission_type, description, cph, active)")
                    .eq("school_id", schoolId)
                    .eq("active", true)
                    .order("username", { ascending: true }),

                // 4. Referrals
                supabase
                    .from("referral")
                    .select("id, code, description, commission_type, commission_value, active")
                    .eq("school_id", schoolId)
                    .eq("active", true),

                // 5. Fetch booking_student with booking and package duration data
                supabase
                    .from("booking_student")
                    .select("student_id, booking!booking_student_booking_id_fk(id, status, student_package!booking_student_package_id_fk(school_package!student_package_school_package_id_fk(duration_minutes)))")
                    .eq("booking.school_id", schoolId),

                // 6. Fetch all lessons by teacher
                supabase
                    .from("lesson")
                    .select("id, teacher_id, status")
                    .eq("school_id", schoolId)
            ]);

        // Check for errors
        if (packagesResult.error) {
            console.error("Packages query error:", packagesResult.error);
            return { success: false, error: "Failed to fetch packages" };
        }
        if (studentsResult.error) {
            console.error("Students query error:", studentsResult.error);
            return { success: false, error: "Failed to fetch students" };
        }
        if (teachersResult.error) {
            console.error("Teachers query error:", teachersResult.error);
            return { success: false, error: "Failed to fetch teachers" };
        }
        if (referralsResult.error) {
            console.error("Referrals query error:", referralsResult.error);
            return { success: false, error: "Failed to fetch referrals" };
        }

        // Compute student stats from booking_student records
        const studentBookingStats: Record<string, StudentBookingTableStats> = {};

        if (bookingsResult.error) {
            console.warn("Booking_student query error:", bookingsResult.error);
        } else if (bookingsResult.data && bookingsResult.data.length > 0) {
            const statsMap = new Map<string, { bookingCount: number; durationMinutes: number; allCompleted: boolean }>();

            for (const record of bookingsResult.data) {
                const studentId = record.student_id;
                const booking = record.booking;
                if (!booking) continue;

                const durationMinutes = booking.student_package?.school_package?.duration_minutes || 0;
                const isCompleted = booking.status === "completed";

                if (!statsMap.has(studentId)) {
                    statsMap.set(studentId, { bookingCount: 0, durationMinutes: 0, allCompleted: true });
                }

                const stats = statsMap.get(studentId)!;
                stats.bookingCount += 1;
                stats.durationMinutes += durationMinutes;
                if (!isCompleted) {
                    stats.allCompleted = false;
                }
            }

            // Convert to final stats format
            for (const [studentId, stats] of statsMap.entries()) {
                studentBookingStats[studentId] = {
                    bookingCount: stats.bookingCount,
                    durationHours: Math.floor(stats.durationMinutes / 60),
                    allBookingsCompleted: stats.allCompleted,
                };
            }
        }

        // Compute teacher stats from lessons
        const teacherLessonStats: Record<string, TeacherLessonTableStats> = {};

        if (lessonsResult.error) {
            console.warn("Lessons query error:", lessonsResult.error);
        } else if (lessonsResult.data && lessonsResult.data.length > 0) {
            const statsMap = new Map<string, { totalLessons: number; plannedLessons: number }>();

            for (const lesson of lessonsResult.data) {
                const teacherId = lesson.teacher_id;
                if (!statsMap.has(teacherId)) {
                    statsMap.set(teacherId, { totalLessons: 0, plannedLessons: 0 });
                }

                const stats = statsMap.get(teacherId)!;
                stats.totalLessons += 1;
                if (lesson.status === "planned") {
                    stats.plannedLessons += 1;
                }
            }

            // Convert to final stats format
            for (const [teacherId, stats] of statsMap.entries()) {
                teacherLessonStats[teacherId] = {
                    totalLessons: stats.totalLessons,
                    plannedLessons: stats.plannedLessons,
                };
            }
        }

        // Transform snake_case to camelCase for packages
        const packages: RegisterPackage[] = (packagesResult.data || []).map((p: any) => ({
            id: p.id,
            durationMinutes: p.duration_minutes,
            description: p.description,
            pricePerStudent: p.price_per_student,
            capacityStudents: p.capacity_students,
            capacityEquipment: p.capacity_equipment,
            categoryEquipment: p.category_equipment,
            packageType: p.package_type,
            isPublic: p.is_public,
            active: p.active,
        }));

        // Transform students
        const students: RegisterSchoolStudent[] = (studentsResult.data || []).map((ss: any) => ({
            id: ss.id,
            studentId: ss.student_id,
            description: ss.description,
            active: ss.active,
            rental: ss.rental,
            student: {
                id: ss.student.id,
                firstName: ss.student.first_name,
                lastName: ss.student.last_name,
                passport: ss.student.passport,
                country: ss.student.country,
                phone: ss.student.phone,
                languages: ss.student.languages,
            },
        }));

        // Transform teachers with commissions (filter active commissions)
        const teachers: RegisterTeacher[] = (teachersResult.data || []).map((t: any) => ({
            id: t.id,
            firstName: t.first_name,
            lastName: t.last_name,
            username: t.username,
            passport: t.passport,
            country: t.country,
            phone: t.phone,
            languages: t.languages,
            schoolId: t.school_id,
            active: t.active,
            commissions: (t.teacher_commission || [])
                .filter((c: any) => c.active)
                .map((c: any) => ({
                    id: c.id,
                    teacherId: c.teacher_id,
                    commissionType: c.commission_type,
                    description: c.description,
                    cph: c.cph,
                    active: c.active,
                })),
        }));

        // Transform referrals
        const referrals: RegisterReferral[] = (referralsResult.data || []).map((r: any) => ({
            id: r.id,
            code: r.code,
            description: r.description,
            commissionType: r.commission_type,
            commissionValue: r.commission_value,
            active: r.active,
        }));

        return {
            success: true,
            data: {
                school: { id: schoolId, name: schoolName, username: schoolUsername },
                packages,
                students,
                teachers,
                referrals,
                studentBookingStats,
                teacherLessonStats,
            },
        };
    } catch (error) {
        console.error("Error in getRegisterTables:", error);
        return { success: false, error: "Failed to fetch register data" };
    }
}
