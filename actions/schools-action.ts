"use server";

import { eq, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { school, student, schoolStudents, type NewSchool } from "@/drizzle/schema";
import { SchoolModel } from "@/backend/models";

// CREATE
export async function createSchool(schoolSchema: NewSchool) {
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
export async function getSchools(): Promise<{ success: boolean; data: SchoolModel[]; error?: string }> {
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
            const schoolModel = new SchoolModel(schoolData);

            // Map relations from query result
            schoolModel.relations = {
                students: schoolData.schoolStudents,
            };

            // Calculate lambda values
            schoolModel.lambda = {
                studentCount: schoolData.schoolStudents.length,
            };

            return schoolModel;
        });

        return { success: true, data: schools };
    } catch (error) {
        console.error("Error fetching schools:", error);
        return { success: false, error: "Failed to fetch schools" };
    }
}

export async function getSchoolById(id: string, username: boolean = false) {
    try {
        const result = await db.query.school.findFirst({
            where: username ? eq(school.username, id) : eq(school.id, id),
            with: {
                schoolStudents: {
                    with: {
                        student: true,
                    },
                },
            },
        });

        if (result) {
            const schoolModel = new SchoolModel(result);

            schoolModel.relations = {
                students: result.schoolStudents,
            };

            schoolModel.lambda = {
                studentCount: result.schoolStudents.length,
            };

            return { success: true, data: schoolModel };
        }
        return { success: true, data: null };
    } catch (error) {
        console.error("Error fetching school:", error);
        return { success: false, error: "Failed to fetch school" };
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
export async function updateSchool(id: string, schoolSchema: Partial<NewSchool>) {
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

        let query = db.select().from(student);

        if (linkedIds.length > 0) {
            query = query.where(notInArray(student.id, linkedIds));
        }

        const result = await query;
        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching available students:", error);
        return { success: false, error: "Failed to fetch available students" };
    }
}
