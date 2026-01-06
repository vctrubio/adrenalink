"use server";

import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
    schoolPackage,
    schoolStudents,
    teacher,
    referral,
    booking,
    lesson,
    student,
    teacherCommission,
    studentPackage,
} from "@/drizzle/schema";

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
 * Fetch all register page data using optimized parallel Drizzle queries
 * No unnecessary transformations - Drizzle handles camelCase automatically
 */
export async function getRegisterTables(
    schoolId: string,
    schoolName: string,
    schoolUsername: string
): Promise<{ success: true; data: RegisterTables } | { success: false; error: string }> {
    return { success: false, error: "Not implemented - use supabase" };
    // try {
    //     // Run all queries in parallel for maximum performance
    //     const [packagesData, studentsData, teachersData, referralsData, bookingsData, lessonsData] =
    //         await Promise.all([
    //             // 1. Packages - active only, oldest first
    //             db.query.schoolPackage.findMany({
    //                 where: eq(schoolPackage.schoolId, schoolId),
    //                 orderBy: (sp) => sp.createdAt,
    //             }),

    //             // 2. School Students with student relations - active only, newest first
    //             db.query.schoolStudents.findMany({
    //                 where: eq(schoolStudents.schoolId, schoolId),
    //                 with: {
    //                     student: {
    //                         columns: {
    //                             id: true,
    //                             firstName: true,
    //                             lastName: true,
    //                             passport: true,
    //                             country: true,
    //                             phone: true,
    //                             languages: true,
    //                         },
    //                     },
    //                 },
    //                 orderBy: (ss) => ss.createdAt,
    //             }),

    //             // 3. Teachers with commissions - active only, oldest first
    //             db.query.teacher.findMany({
    //                 where: eq(teacher.schoolId, schoolId),
    //                 with: {
    //                     commissions: {
    //                         columns: {
    //                             id: true,
    //                             teacherId: true,
    //                             commissionType: true,
    //                             description: true,
    //                             cph: true,
    //                             active: true,
    //                         },
    //                     },
    //                 },
    //                 orderBy: (t) => t.createdAt,
    //             }),

    //             // 4. Referrals - active only
    //             db.query.referral.findMany({
    //                 where: eq(referral.schoolId, schoolId),
    //             }),

    //             // 5. Bookings with student packages for stats calculation
    //             db.query.booking.findMany({
    //                 where: eq(booking.schoolId, schoolId),
    //                 columns: {
    //                     id: true,
    //                     status: true,
    //                     studentPackageId: true,
    //                 },
    //                 with: {
    //                     studentPackage: {
    //                         columns: {
    //                             schoolPackageId: true,
    //                         },
    //                         with: {
    //                             schoolPackage: {
    //                                 columns: {
    //                                     durationMinutes: true,
    //                                 },
    //                             },
    //                         },
    //                     },
    //                     bookingStudents: {
    //                         columns: {
    //                             studentId: true,
    //                         },
    //                     },
    //                 },
    //             }),

    //             // 6. All lessons by teacher for stats
    //             db.query.lesson.findMany({
    //                 where: eq(lesson.schoolId, schoolId),
    //                 columns: {
    //                     id: true,
    //                     teacherId: true,
    //                     status: true,
    //                 },
    //             }),
    //         ]);

    //     // Compute student booking stats
    //     const studentBookingStats: Record<string, StudentBookingTableStats> = {};

    //     for (const b of bookingsData) {
    //         const bookingStudentList = b.bookingStudents || [];
    //         for (const bs of bookingStudentList) {
    //             const studentId = bs.studentId;
    //             const durationMinutes = b.studentPackage?.schoolPackage?.durationMinutes || 0;
    //             const isCompleted = b.status === "active";

    //             if (!studentBookingStats[studentId]) {
    //                 studentBookingStats[studentId] = {
    //                     bookingCount: 0,
    //                     durationHours: 0,
    //                     allBookingsCompleted: true,
    //                 };
    //             }

    //             studentBookingStats[studentId].bookingCount += 1;
    //             studentBookingStats[studentId].durationHours += Math.floor(durationMinutes / 60);
    //             if (!isCompleted) {
    //                 studentBookingStats[studentId].allBookingsCompleted = false;
    //             }
    //         }
    //     }

    //     // Compute teacher lesson stats
    //     const teacherLessonStats: Record<string, TeacherLessonTableStats> = {};

    //     for (const l of lessonsData) {
    //         const teacherId = l.teacherId;
    //         if (!teacherLessonStats[teacherId]) {
    //             teacherLessonStats[teacherId] = {
    //                 totalLessons: 0,
    //                 plannedLessons: 0,
    //             };
    //         }

    //         teacherLessonStats[teacherId].totalLessons += 1;
    //         if (l.status === "planned") {
    //             teacherLessonStats[teacherId].plannedLessons += 1;
    //         }
    //     }

    //     // Transform teachers - filter active commissions
    //     const transformedTeachers: RegisterTeacher[] = teachersData.map((t) => ({
    //         id: t.id,
    //         firstName: t.firstName,
    //         lastName: t.lastName,
    //         username: t.username,
    //         passport: t.passport,
    //         country: t.country,
    //         phone: t.phone,
    //         languages: t.languages,
    //         schoolId: t.schoolId,
    //         active: t.active,
    //         commissions: (t.commissions || [])
    //             .filter((c) => c.active)
    //             .map((c) => ({
    //                 id: c.id,
    //                 teacherId: c.teacherId,
    //                 commissionType: c.commissionType,
    //                 description: c.description,
    //                 cph: c.cph,
    //                 active: c.active,
    //             })),
    //     }));

    //     // Transform students
    //     const transformedStudents: RegisterSchoolStudent[] = studentsData.map((ss) => ({
    //         id: ss.id,
    //         studentId: ss.studentId,
    //         description: ss.description,
    //         active: ss.active,
    //         rental: ss.rental,
    //         student: {
    //             id: ss.student.id,
    //             firstName: ss.student.firstName,
    //             lastName: ss.student.lastName,
    //             passport: ss.student.passport,
    //             country: ss.student.country,
    //             phone: ss.student.phone,
    //             languages: ss.student.languages,
    //         },
    //     }));

    //     return {
    //         success: true,
    //         data: {
    //             school: { id: schoolId, name: schoolName, username: schoolUsername },
    //             packages: packagesData as RegisterPackage[],
    //             students: transformedStudents,
    //             teachers: transformedTeachers,
    //             referrals: referralsData as RegisterReferral[],
    //             studentBookingStats,
    //             teacherLessonStats,
    //         },
    //     };
    // } catch (error) {
    //     console.error("Error in getRegisterTables:", error);
    //     return { success: false, error: "Failed to fetch register data" };
    // }
}
