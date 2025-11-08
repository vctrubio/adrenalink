"use server";

import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { student } from "@/drizzle/schema";
import { createStudentModel, type StudentModel } from "@/backend/models";
import { buildStudentStatsQuery, createStatsMap } from "@/getters/databoard-sql-stats";
import type { ApiActionResponseModel } from "@/types/actions";

// Student relations for detail page
const studentWithRelations = {
    schoolStudents: true,
    studentPackageStudents: {
        with: {
            studentPackage: {
                with: {
                    schoolPackage: true,
                },
            },
        },
    },
    bookingStudents: {
        with: {
            booking: {
                with: {
                    lessons: {
                        with: {
                            teacher: true,
                            events: true,
                        },
                    },
                    studentPackage: {
                        with: {
                            schoolPackage: true,
                        },
                    },
                },
            },
        },
    },
    bookingPayments: true,
};

export async function getIdStudent(studentId: string): Promise<ApiActionResponseModel<StudentModel>> {
    try {
        // 1. Fetch student with full relations
        const studentData = await db.query.student.findFirst({
            where: eq(student.id, studentId),
            with: studentWithRelations,
        });

        if (!studentData) {
            return { success: false, error: "Student not found" };
        }

        // 2. Fetch stats for this student
        const statsQuery = db.execute(buildStudentStatsQuery());
        const statsResult = await statsQuery;

        // 3. Create stats map
        const statsRows = Array.isArray(statsResult) ? statsResult : (statsResult as any).rows || [];
        const statsMap = createStatsMap(statsRows);

        // 4. Create model with stats
        const studentModel: StudentModel = {
            ...createStudentModel(studentData),
            stats: statsMap.get(studentId),
        };

        return { success: true, data: studentModel };
    } catch (error) {
        console.error("Error fetching student:", error);
        return { success: false, error: "Failed to fetch student" };
    }
}
