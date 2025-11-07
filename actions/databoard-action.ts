"use server";

import { eq, exists, and } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { getHeaderUsername } from "@/types/headers";
import { student, school, schoolStudents, teacher } from "@/drizzle/schema";
import { createStudentModel, createTeacherModel, type StudentModel, type TeacherModel } from "@/backend/models";
import type { ApiActionResponseModel } from "@/types/actions";

// GET STUDENTS
export async function getStudents(): Promise<ApiActionResponseModel<StudentModel[]>> {
    try {
        const header = await getHeaderUsername();

        let result;
        if (header) {
            // Filter students by school username
            result = await db.query.student.findMany({
                where: exists(
                    db
                        .select()
                        .from(schoolStudents)
                        .innerJoin(school, eq(schoolStudents.schoolId, school.id))
                        .where(and(eq(schoolStudents.studentId, student.id), eq(school.username, header))),
                ),
                with: {
                    bookingStudents: {
                        with: {
                            booking: {
                                with: {
                                    studentPackage: {
                                        with: {
                                            schoolPackage: true,
                                        },
                                    },
                                    studentPayments: true,
                                    lessons: {
                                        with: {
                                            events: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    studentPackageStudents: {
                        with: {
                            studentPackage: {
                                columns: {
                                    id: true,
                                    status: true,
                                },
                            },
                        },
                    },
                    bookingPayments: true,
                },
            });
        } else {
            // Global query (admin mode)
            result = await db.query.student.findMany({
                with: {
                    bookingStudents: {
                        with: {
                            booking: {
                                with: {
                                    studentPackage: {
                                        with: {
                                            schoolPackage: true,
                                        },
                                    },
                                    studentPayments: true,
                                    lessons: {
                                        with: {
                                            events: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    studentPackageStudents: {
                        with: {
                            studentPackage: {
                                columns: {
                                    id: true,
                                    status: true,
                                },
                            },
                        },
                    },
                    bookingPayments: true,
                },
            });
        }

        const students: StudentModel[] = result.map((studentData) => createStudentModel(studentData));

        return { success: true, data: students };
    } catch (error) {
        console.error("Error fetching students:", error);
        return { success: false, error: "Failed to fetch students" };
    }
}

// GET TEACHERS
export async function getTeachers(): Promise<ApiActionResponseModel<TeacherModel[]>> {
    try {
        const header = await getHeaderUsername();

        let result;
        if (header) {
            // Filter teachers by school username
            const schoolData = await db.query.school.findFirst({
                where: eq(school.username, header),
            });

            if (!schoolData) {
                return { success: true, data: [] };
            }

            result = await db.query.teacher.findMany({
                where: eq(teacher.schoolId, schoolData.id),
                with: {
                    lessons: {
                        with: {
                            commission: true,
                            events: true,
                        },
                    },
                },
            });
        } else {
            // Global query (admin mode)
            result = await db.query.teacher.findMany({
                with: {
                    lessons: {
                        with: {
                            commission: true,
                            events: true,
                        },
                    },
                },
            });
        }

        const teachers: TeacherModel[] = result.map((teacherData) => createTeacherModel(teacherData));

        return { success: true, data: teachers };
    } catch (error) {
        console.error("Error fetching teachers:", error);
        return { success: false, error: "Failed to fetch teachers" };
    }
}
