"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { student, type NewStudent } from "@/drizzle/schema";

export async function createStudent(studentSchema: NewStudent) {
  try {
    const result = await db.insert(student).values(studentSchema).returning();
    revalidatePath("/students");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error creating student:", error);
    return { success: false, error: "Failed to create student" };
  }
}

export async function getStudents() {
  try {
    const result = await db.select().from(student);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching students:", error);
    return { success: false, error: "Failed to fetch students" };
  }
}

export async function getStudentById(id: number) {
  try {
    const result = await db.select().from(student).where(eq(student.id, id));
    return { success: true, data: result[0] || null };
  } catch (error) {
    console.error("Error fetching student:", error);
    return { success: false, error: "Failed to fetch student" };
  }
}

export async function updateStudent(id: number, studentSchema: Partial<NewStudent>) {
  try {
    const result = await db
      .update(student)
      .set(studentSchema)
      .where(eq(student.id, id))
      .returning();
    revalidatePath("/students");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error updating student:", error);
    return { success: false, error: "Failed to update student" };
  }
}

export async function deleteStudent(id: number) {
  try {
    await db.delete(student).where(eq(student.id, id));
    revalidatePath("/students");
    return { success: true };
  } catch (error) {
    console.error("Error deleting student:", error);
    return { success: false, error: "Failed to delete student" };
  }
}
