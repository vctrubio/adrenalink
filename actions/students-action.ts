"use server";

import { eq, notInArray, exists, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { getSchoolHeader } from "@/types/headers";
import { student, school, schoolStudents, type StudentForm, type StudentType, type SchoolType, type SchoolStudentType } from "@/drizzle/schema";
import { createStudentModel, type StudentModel, type StudentUpdateForm } from "@/backend/models";
import type { ApiActionResponseModel } from "@/types/actions";

const studentWithRelations = {
    schoolStudents: {
        with: {
            school: true,
        },
    },
    studentPackageStudents: {
        with: {
            studentPackage: true,
        },
    },
    bookingStudents: true,
};

// CREATE
export async function createStudent(studentSchema: StudentForm): Promise<ApiActionResponseModel<StudentType>> {
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
export async function getStudents(): Promise<ApiActionResponseModel<StudentModel[]>> {
    try {
        const schoolHeader = await getSchoolHeader();

        let result;
        if (schoolHeader) {
            // Filter students by school username
            result = await db.query.student.findMany({
                where: exists(
                    db
                        .select()
                        .from(schoolStudents)
                        .innerJoin(school, eq(schoolStudents.schoolId, school.id))
                        .where(and(eq(schoolStudents.studentId, student.id), eq(school.username, schoolHeader.name))),
                ),
                with: studentWithRelations,
            });
        } else {
            // Global query (admin mode)
            result = await db.query.student.findMany({
                with: studentWithRelations,
            });
        }

        const students: StudentModel[] = result.map((studentData) => createStudentModel(studentData));
        return { success: true, data: students };
    } catch (error) {
        console.error("Error fetching students:", error);
        return { success: false, error: "Failed to fetch students" };
    }
}

export async function getStudentById(id: string): Promise<ApiActionResponseModel<StudentModel>> {
    try {
        const result = await db.query.student.findFirst({
            where: eq(student.id, id),
            with: studentWithRelations,
        });

        if (result) {
            return { success: true, data: createStudentModel(result) };
        }
        return { success: false, error: "Student not found" };
    } catch (error) {
        console.error("Error fetching student:", error);
        return { success: false, error: "Failed to fetch student" };
    }
}

// UPDATE
export async function updateStudent(id: string, studentSchema: Partial<StudentForm>): Promise<ApiActionResponseModel<StudentType>> {
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
export async function deleteStudent(id: string): Promise<ApiActionResponseModel<null>> {
    try {
        await db.delete(student).where(eq(student.id, id));
        revalidatePath("/students");
        return { success: true, data: null };
    } catch (error) {
        console.error("Error deleting student:", error);
        return { success: false, error: "Failed to delete student" };
    }
}

// RELATIONS
export async function getSchoolsByStudentId(studentId: string): Promise<ApiActionResponseModel<SchoolType[]>> {
    try {
        const result = await db
            .select({
                id: school.id,
                name: school.name,
                username: school.username,
                country: school.country,
                phone: school.phone,
                latitude: school.latitude,
                longitude: school.longitude,
                googlePlaceId: school.googlePlaceId,
                equipmentCategories: school.equipmentCategories,
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

export async function getAvailableSchoolsForStudent(studentId: string): Promise<ApiActionResponseModel<SchoolType[]>> {
    try {
        const linkedSchoolIds = await db.select({ schoolId: schoolStudents.schoolId }).from(schoolStudents).where(eq(schoolStudents.studentId, studentId));

        const linkedIds = linkedSchoolIds.map((row) => row.schoolId);

        const query = linkedIds.length > 0 ? db.select().from(school).where(notInArray(school.id, linkedIds)) : db.select().from(school);

        const result = await query;
        return { success: true, data: result };
    } catch (error) {
        console.error("Error fetching available schools:", error);
        return { success: false, error: "Failed to fetch available schools" };
    }
}

export async function linkStudentToSchool(studentId: string, schoolId: string, description?: string): Promise<ApiActionResponseModel<SchoolStudentType>> {
    try {
        const result = await db
            .insert(schoolStudents)
            .values({
                studentId,
                schoolId,
                description,
            })
            .returning();
        revalidatePath(`/students/${studentId}`);
        revalidatePath(`/schools/${schoolId}`);
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error linking student to school:", error);
        return { success: false, error: "Failed to link student to school" };
    }
}

// UPDATE STUDENT WITH SCHOOL-SPECIFIC DATA
export async function updateStudentDetail(
    data: StudentUpdateForm,
): Promise<ApiActionResponseModel<StudentModel>> {
    try {
        const schoolHeader = await getSchoolHeader();
        if (!schoolHeader) {
            return { success: false, error: "School context not found" };
        }

        // Update student table
        await db.update(student).set({
            firstName: data.firstName,
            lastName: data.lastName,
            passport: data.passport,
            country: data.country,
            phone: data.phone,
            languages: data.languages,
        }).where(eq(student.id, data.id));

        // Update schoolStudents table
        await db.update(schoolStudents).set({
            description: data.description,
            active: data.active,
            rental: data.rental,
        }).where(and(eq(schoolStudents.studentId, data.id), eq(schoolStudents.schoolId, schoolHeader.id)));

        revalidatePath(`/students/${data.id}`);

        // Fetch and return updated student
        const result = await db.query.student.findFirst({
            where: eq(student.id, data.id),
            with: {
                schoolStudents: {
                    where: eq(schoolStudents.schoolId, schoolHeader.id),
                    with: {
                        school: true,
                    },
                },
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
                        booking: true,
                    },
                },
                bookingPayments: true,
            },
        });

        if (!result) {
            return { success: false, error: "Student not found after update" };
        }

        return { success: true, data: createStudentModel(result) };
    } catch (error) {
        console.error("Error updating student:", error);
        return { success: false, error: "Failed to update student" };
    }
}

// UPDATE SCHOOL STUDENT ACTIVE STATUS
export async function updateSchoolStudentActive(studentId: string, active: boolean): Promise<ApiActionResponseModel<SchoolStudentType>> {
    try {
        const schoolHeader = await getSchoolHeader();

        if (!schoolHeader) {
            return { success: false, error: "School not found from header" };
        }

        const result = await db
            .update(schoolStudents)
            .set({ active })
            .where(and(eq(schoolStudents.studentId, studentId), eq(schoolStudents.schoolId, schoolHeader.id)))
            .returning();

        if (!result[0]) {
            return { success: false, error: "School student record not found" };
        }

        revalidatePath("/students");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error updating school student active status:", error);
        return { success: false, error: "Failed to update school student active status" };
    }
}
