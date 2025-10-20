"use server";

import { eq, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { school, student, schoolStudents, type SchoolForm, type SchoolType } from "@/drizzle/schema";
import { createSchoolModel, type SchoolModel } from "@/backend/models/SchoolModel";
import type { ApiActionResponseModel, ApiActionResponseModelArray } from "@/types/actions";

// DRY: Standard school relations query
const schoolWithRelations = {
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
    bookings: {
        with: {
            studentPackage: {
                with: {
                    student: true,
                },
            },
        },
    },
};

// CREATE
export async function createSchool(schoolSchema: SchoolForm): Promise<ApiActionResponseModel<SchoolType>> {
    try {
        const result = await db.insert(school).values(schoolSchema).returning();
        revalidatePath("/schools");
        // Return plain object instead of class instance for create operations
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error creating school - Full error:", error);
        console.error("School data being inserted:", schoolSchema);
        return { error: "Failed to create school" };
    }
}

// READ
export async function getSchools(): Promise<ApiActionResponseModelArray<SchoolType>> {
    try {
        const result = await db.query.school.findMany({
            with: schoolWithRelations,
        });

        const schools: SchoolModel[] = result.map((schoolData) => {
            return createSchoolModel(schoolData);
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
            with: schoolWithRelations,
        });

        if (result) {
            return createSchoolModel(result);
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
