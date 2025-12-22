"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { getSchoolHeader } from "@/types/headers";
import { teacher, type TeacherForm, type TeacherType } from "@/drizzle/schema";
import { createTeacherModel, type TeacherModel, type TeacherUpdateForm } from "@/backend/models";
import type { ApiActionResponseModel } from "@/types/actions";

const teacherWithRelations = {
    school: true,
    commissions: true,
    lessons: {
        with: {
            events: true,
            booking: {
                with: {
                    studentPackage: {
                        with: {
                            schoolPackage: true,
                        },
                    },
                },
            },
        },
    },
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

// UPDATE TEACHER WITH SCHOOL-SPECIFIC DATA
export async function updateTeacherDetail(
    data: TeacherUpdateForm,
): Promise<ApiActionResponseModel<TeacherModel>> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        // Update teacher table
        await db.update(teacher).set({
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            passport: data.passport,
            country: data.country,
            phone: data.phone,
            languages: data.languages,
            active: data.active,
        }).where(eq(teacher.id, data.id));

        revalidatePath(`/teachers/${data.username}`);

        // Fetch and return updated teacher
        const result = await db.query.teacher.findFirst({
            where: eq(teacher.id, data.id),
            with: {
                school: true,
                commissions: true,
                lessons: {
                    with: {
                        events: true,
                        booking: true,
                    },
                },
            },
        });

        if (!result) {
            return { success: false, error: "Teacher not found after update" };
        }

        return { success: true, data: createTeacherModel(result) };
    } catch (error) {
        console.error("Error updating teacher:", error);
        return { success: false, error: "Failed to update teacher" };
    }
}

// UPDATE TEACHER ACTIVE STATUS
export async function updateTeacherActive(teacherId: string, active: boolean): Promise<ApiActionResponseModel<TeacherType>> {
    try {
        const result = await db.update(teacher).set({ active }).where(eq(teacher.id, teacherId)).returning();

        if (!result[0]) {
            return { success: false, error: "Teacher not found" };
        }

        revalidatePath("/teachers");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error updating teacher active status:", error);
        return { success: false, error: "Failed to update teacher active status" };
    }
}
