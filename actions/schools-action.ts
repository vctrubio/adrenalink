"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { school, type NewSchool } from "@/drizzle/schema";

export async function createSchool(schoolSchema: NewSchool) {
    try {
        const result = await db
            .insert(school)
            .values(schoolSchema)
            .returning();
        revalidatePath("/schools");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error creating school:", error);
        return { success: false, error: "Failed to create school" };
    }
}

export async function getSchools() {
    try {
        const result = await db.select().from(school);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching schools:", error);
        return { success: false, error: "Failed to fetch schools" };
    }
}

export async function getSchoolById(id: number) {
    try {
        const result = await db.select().from(school).where(eq(school.id, id));
        return { success: true, data: result[0] || null };
    } catch (error) {
        console.error("Error fetching school:", error);
        return { success: false, error: "Failed to fetch school" };
    }
}

export async function updateSchool(id: number, schoolSchema: Partial<NewSchool>) {
    try {
        const result = await db
            .update(school)
            .set(schoolSchema)
            .where(eq(school.id, id))
            .returning();
        revalidatePath("/schools");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error updating school:", error);
        return { success: false, error: "Failed to update school" };
    }
}

export async function deleteSchool(id: number) {
    try {
        await db.delete(school).where(eq(school.id, id));
        revalidatePath("/schools");
        return { success: true };
    } catch (error) {
        console.error("Error deleting school:", error);
        return { success: false, error: "Failed to delete school" };
    }
}

export async function getSchoolsUsernames() {
    try {
        const result = await db.select({ username: school.username }).from(school);
        return { success: true, data: result.map(r => r.username) };
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