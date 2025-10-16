"use server";

import { eq, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { student, school, schoolStudents, type NewStudent } from "@/drizzle/schema";
import { StudentModel } from "@/backend/models";

// CREATE
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

// READ
export async function getStudents(): Promise<{ success: boolean; data: StudentModel[]; error?: string }> {
    try {
        const result = await db.query.student.findMany({
            with: {
                schoolStudents: {
                    with: {
                        school: true
                    }
                }
            }
        });
        
        const students: StudentModel[] = result.map(studentData => {
            const studentModel = new StudentModel(studentData);
            
            // Map relations from query result
            studentModel.relations = {
                schools: studentData.schoolStudents
            };
            
            // Calculate lambda values
            studentModel.lambda = {
                schoolCount: studentData.schoolStudents.length
            };
            
            return studentModel;
        });
        
        return { success: true, data: students };
    } catch (error) {
        console.error("Error fetching students:", error);
        return { success: false, error: "Failed to fetch students" };
    }
}

export async function getStudentById(id: string) {
    try {
        const result = await db.query.student.findFirst({
            where: eq(student.id, id),
            with: {
                schoolStudents: {
                    with: {
                        school: true
                    }
                }
            }
        });
        
        if (result) {
            const studentModel = new StudentModel(result);
            
            // Map relations from query result
            studentModel.relations = {
                schools: result.schoolStudents
            };
            
            // Calculate lambda values
            studentModel.lambda = {
                schoolCount: result.schoolStudents.length
            };
            
            return { success: true, data: studentModel };
        }
        return { success: true, data: null };
    } catch (error) {
        console.error("Error fetching student:", error);
        return { success: false, error: "Failed to fetch student" };
    }
}

// UPDATE
export async function updateStudent(id: string, studentSchema: Partial<NewStudent>) {
    try {
        const result = await db.update(student).set(studentSchema).where(eq(student.id, id)).returning();
        revalidatePath("/students");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error updating student:", error);
        return { success: false, error: "Failed to update student" };
    }
}

// DELETE
export async function deleteStudent(id: string) {
    try {
        await db.delete(student).where(eq(student.id, id));
        revalidatePath("/students");
        return { success: true };
    } catch (error) {
        console.error("Error deleting student:", error);
        return { success: false, error: "Failed to delete student" };
    }
}

// RELATIONS
export async function getSchoolsByStudentId(studentId: string) {
    try {
        const result = await db
            .select({
                id: school.id,
                name: school.name,
                username: school.username,
                country: school.country,
                phone: school.phone,
                createdAt: school.createdAt,
                updatedAt: school.updatedAt,
            })
            .from(schoolStudents)
            .innerJoin(school, eq(schoolStudents.schoolId, school.id))
            .where(eq(schoolStudents.studentId, studentId));
        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching schools by student ID:", error);
        return { success: false, error: "Failed to fetch schools" };
    }
}

export async function getAvailableSchoolsForStudent(studentId: string) {
    try {
        const linkedSchoolIds = await db
            .select({ schoolId: schoolStudents.schoolId })
            .from(schoolStudents)
            .where(eq(schoolStudents.studentId, studentId));
        
        const linkedIds = linkedSchoolIds.map(row => row.schoolId);
        
        let query = db.select().from(school);
        
        if (linkedIds.length > 0) {
            query = query.where(notInArray(school.id, linkedIds));
        }
        
        const result = await query;
        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching available schools:", error);
        return { success: false, error: "Failed to fetch available schools" };
    }
}

export async function linkStudentToSchool(studentId: string, schoolId: string) {
    try {
        const result = await db.insert(schoolStudents).values({
            studentId,
            schoolId,
        }).returning();
        revalidatePath(`/students/${studentId}`);
        revalidatePath(`/schools/${schoolId}`);
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error linking student to school:", error);
        return { success: false, error: "Failed to link student to school" };
    }
}
