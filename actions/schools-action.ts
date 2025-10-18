"use server";

import { eq, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { school, student, schoolStudents, type SchoolForm, type SchoolType } from "@/drizzle/schema";
import { SchoolModel } from "@/backend/models";
import type { ApiActionResponseModel, ApiActionResponseModelArray } from "@/types/actions";

// CREATE
export async function createSchool(schoolSchema: SchoolForm) {
    try {
        const result = await db.insert(school).values(schoolSchema).returning();
        revalidatePath("/schools");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error creating school:", error);
        return { success: false, error: "Failed to create school" };
    }
}

// READ
export async function getSchools(): Promise<ApiActionResponseModelArray<SchoolType>> {
    try {
        const result = await db.query.school.findMany({
            with: {
                schoolStudents: {
                    with: {
                        student: true,
                    },
                },
            },
        });

        const schools: SchoolModel[] = result.map((schoolData) => {
            const { schoolStudents, ...pureSchema } = schoolData;
            const schoolModel = new SchoolModel(pureSchema);

            // Map relations from query result
            schoolModel.relations = {
                schoolStudents: schoolStudents,
            };

            // Calculate lambda values
            schoolModel.lambda = {
                studentCount: schoolStudents.length,
            };

            return schoolModel;
        });

        return schools;
    } catch (error) {
        console.error("Error fetching schools:", error);
        return { error: "Failed to fetch schools" };
    }
}


export async function getSchoolById(id: string, username: boolean = false): Promise<ApiActionResponseModel<SchoolType>> {
    try {
        const result = await db.query.school.findFirst({
            where: username ? eq(school.username, id) : eq(school.id, id),
            with: {
                schoolStudents: {
                    with: {
                        student: true,
                    },
                },
                schoolPackages: {
                    with: {
                        studentPackages: {
                            with: {
                                student: true,
                            },
                        },
                    },
                },
            },
        });

        if (result) {
            const { schoolStudents, schoolPackages, ...pureSchema } = result;
            const schoolModel = new SchoolModel(pureSchema);

            schoolModel.relations = {
                schoolStudents: schoolStudents,
                schoolPackages: schoolPackages,
            };

            schoolModel.lambda = {
                studentCount: schoolStudents.length,
                packageCount: schoolPackages.length,
                totalStudentRequests: schoolPackages.reduce((acc, pkg) => acc + pkg.studentPackages.length, 0),
            };

            return schoolModel;
        }
        return { error: "School not found" };
    } catch (error) {
        console.error("Error fetching school:", error);
        return { error: "Failed to fetch school" };
    }
}

export async function getSchoolsUsernames() {
    try {
        const result = await db.select({ username: school.username }).from(school);
        return { success: true, data: result.map((r) => r.username) };
    } catch (error) {
        console.error("Error fetching school usernames:", error);
        return { success: false, error: "Failed to fetch usernames" };
    }
}

export async function checkUsernameAvailability(username: string) {
    try {
        const result = await db.select({ username: school.username }).from(school).where(eq(school.username, username));
        return { success: true, available: result.length === 0 };
    } catch (error) {
        console.error("Error checking username availability:", error);
        return { success: false, error: "Failed to check username availability" };
    }
}

// UPDATE
export async function updateSchool(id: string, schoolSchema: Partial<SchoolForm>) {
    try {
        const result = await db.update(school).set(schoolSchema).where(eq(school.id, id)).returning();
        revalidatePath("/schools");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error updating school:", error);
        return { success: false, error: "Failed to update school" };
    }
}

// DELETE
export async function deleteSchool(id: string) {
    try {
        await db.delete(school).where(eq(school.id, id));
        revalidatePath("/schools");
        return { success: true };
    } catch (error) {
        console.error("Error deleting school:", error);
        return { success: false, error: "Failed to delete school" };
    }
}

// RELATIONS
export async function getStudentsBySchoolId(schoolId: string) {
    try {
        const result = await db
            .select({
                id: student.id,
                name: student.name,
                passport: student.passport,
                country: student.country,
                phone: student.phone,
                createdAt: student.createdAt,
                updatedAt: student.updatedAt,
            })
            .from(schoolStudents)
            .innerJoin(student, eq(schoolStudents.studentId, student.id))
            .where(eq(schoolStudents.schoolId, schoolId));
        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching students by school ID:", error);
        return { success: false, error: "Failed to fetch students" };
    }
}

export async function getAvailableStudentsForSchool(schoolId: string) {
    try {
        const linkedStudentIds = await db.select({ studentId: schoolStudents.studentId }).from(schoolStudents).where(eq(schoolStudents.schoolId, schoolId));

        const linkedIds = linkedStudentIds.map((row) => row.studentId);

        const query = linkedIds.length > 0 ? db.select().from(student).where(notInArray(student.id, linkedIds)) : db.select().from(student);

        const result = await query;
        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching available students:", error);
        return { success: false, error: "Failed to fetch available students" };
    }
}
