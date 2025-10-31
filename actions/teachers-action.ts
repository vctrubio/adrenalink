"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { teacher, type TeacherForm, type TeacherType } from "@/drizzle/schema";
import { createTeacherModel, type TeacherModel } from "@/backend/models";
import type { ApiActionResponseModel } from "@/types/actions";

const teacherWithRelations = {
    school: true,
    commissions: true,
    lessons: true,
    equipments: {
        with: {
            equipment: true,
        },
    },
};

// CREATE
export async function createTeacher(teacherSchema: TeacherForm): Promise<ApiActionResponseModel<TeacherType>> {
    try {
        const result = await db.insert(teacher).values(teacherSchema).returning();
        revalidatePath("/teachers");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error creating teacher:", error);
        return { success: false, error: "Failed to create teacher" };
    }
}

// READ
export async function getTeachers(): Promise<ApiActionResponseModel<TeacherModel[]>> {
    try {
        const result = await db.query.teacher.findMany({
            with: teacherWithRelations,
        });

        const teachers: TeacherModel[] = result.map((teacherData) => {
            return createTeacherModel(teacherData);
        });

        return { success: true, data: teachers };
    } catch (error) {
        console.error("Error fetching teachers:", error);
        return { success: false, error: "Failed to fetch teachers" };
    }
}

export async function getTeacherById(id: string): Promise<ApiActionResponseModel<TeacherModel>> {
    try {
        const result = await db.query.teacher.findFirst({
            where: eq(teacher.id, id),
            with: teacherWithRelations,
        });

        if (result) {
            return { success: true, data: createTeacherModel(result) };
        }
        return { success: false, error: "Teacher not found" };
    } catch (error) {
        console.error("Error fetching teacher:", error);
        return { success: false, error: "Failed to fetch teacher" };
    }
}

// UPDATE
export async function updateTeacher(id: string, teacherSchema: Partial<TeacherForm>): Promise<ApiActionResponseModel<TeacherType>> {
    try {
        const result = await db.update(teacher).set(teacherSchema).where(eq(teacher.id, id)).returning();
        revalidatePath("/teachers");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error updating teacher:", error);
        return { success: false, error: "Failed to update teacher" };
    }
}

// DELETE
export async function deleteTeacher(id: string): Promise<ApiActionResponseModel<null>> {
    try {
        await db.delete(teacher).where(eq(teacher.id, id));
        revalidatePath("/teachers");
        return { success: true, data: null };
    } catch (error) {
        console.error("Error deleting teacher:", error);
        return { success: false, error: "Failed to delete teacher" };
    }
}

// RELATIONS
export async function getTeachersBySchoolId(schoolId: string): Promise<ApiActionResponseModel<TeacherModel[]>> {
    try {
        const result = await db.query.teacher.findMany({
            where: eq(teacher.schoolId, schoolId),
            with: teacherWithRelations,
        });

        const teachers: TeacherModel[] = result.map((teacherData) => {
            return createTeacherModel(teacherData);
        });

        return { success: true, data: teachers };
    } catch (error) {
        console.error("Error fetching teachers by school ID:", error);
        return { success: false, error: "Failed to fetch teachers" };
    }
}
