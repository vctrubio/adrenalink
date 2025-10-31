"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { lesson, type LessonForm, type LessonType } from "@/drizzle/schema";
import { createLessonModel, type LessonModel } from "@/backend/models";
import type { ApiActionResponseModel } from "@/types/actions";

const lessonWithRelations = {
    teacher: true,
    commission: true,
    events: {
        with: {
            equipmentEvents: {
                with: {
                    equipment: true,
                },
            },
        },
    },
    payments: true,
    feedback: true,
};

// CREATE
export async function createLesson(lessonSchema: LessonForm): Promise<ApiActionResponseModel<LessonType>> {
    try {
        const result = await db.insert(lesson).values(lessonSchema).returning();
        revalidatePath("/lessons");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error creating lesson:", error);
        return { success: false, error: "Failed to create lesson" };
    }
}

// READ
export async function getLessons(): Promise<ApiActionResponseModel<LessonModel[]>> {
    try {
        const result = await db.query.lesson.findMany({
            with: lessonWithRelations,
        });

        const lessons: LessonModel[] = result.map((lessonData) => {
            return createLessonModel(lessonData);
        });

        return { success: true, data: lessons };
    } catch (error) {
        console.error("Error fetching lessons:", error);
        return { success: false, error: "Failed to fetch lessons" };
    }
}

export async function getLessonById(id: string): Promise<ApiActionResponseModel<LessonModel>> {
    try {
        const result = await db.query.lesson.findFirst({
            where: eq(lesson.id, id),
            with: lessonWithRelations,
        });

        if (result) {
            return { success: true, data: createLessonModel(result) };
        }
        return { success: false, error: "Lesson not found" };
    } catch (error) {
        console.error("Error fetching lesson:", error);
        return { success: false, error: "Failed to fetch lesson" };
    }
}

// UPDATE
export async function updateLesson(id: string, lessonSchema: Partial<LessonForm>): Promise<ApiActionResponseModel<LessonType>> {
    try {
        const result = await db.update(lesson).set(lessonSchema).where(eq(lesson.id, id)).returning();
        revalidatePath("/lessons");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error updating lesson:", error);
        return { success: false, error: "Failed to update lesson" };
    }
}

// DELETE
export async function deleteLesson(id: string): Promise<ApiActionResponseModel<null>> {
    try {
        await db.delete(lesson).where(eq(lesson.id, id));
        revalidatePath("/lessons");
        return { success: true, data: null };
    } catch (error) {
        console.error("Error deleting lesson:", error);
        return { success: false, error: "Failed to delete lesson" };
    }
}

// RELATIONS
export async function getLessonsByBookingId(bookingId: string): Promise<ApiActionResponseModel<LessonModel[]>> {
    try {
        const result = await db.query.lesson.findMany({
            where: eq(lesson.bookingId, bookingId),
            with: lessonWithRelations,
        });

        const lessons: LessonModel[] = result.map((lessonData) => {
            return createLessonModel(lessonData);
        });

        return { success: true, data: lessons };
    } catch (error) {
        console.error("Error fetching lessons by booking ID:", error);
        return { success: false, error: "Failed to fetch lessons" };
    }
}

export async function getLessonsByTeacherId(teacherId: string): Promise<ApiActionResponseModel<LessonModel[]>> {
    try {
        const result = await db.query.lesson.findMany({
            where: eq(lesson.teacherId, teacherId),
            with: lessonWithRelations,
        });

        const lessons: LessonModel[] = result.map((lessonData) => {
            return createLessonModel(lessonData);
        });

        return { success: true, data: lessons };
    } catch (error) {
        console.error("Error fetching lessons by teacher ID:", error);
        return { success: false, error: "Failed to fetch lessons" };
    }
}
