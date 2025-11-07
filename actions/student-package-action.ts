"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { getHeaderUsername } from "@/types/headers";
import { studentPackage, student, schoolPackage, school, type StudentPackageForm } from "@/drizzle/schema";
import { createStudentPackageModel, type StudentPackageModel } from "@/backend/models";
import { buildStudentPackageStatsQuery, createStatsMap } from "@/getters/databoard-sql-stats";
import type { ApiActionResponseModel } from "@/types/actions";

const studentPackageWithRelations = {
    schoolPackage: {
        with: {
            school: true,
        },
    },
    studentPackageStudents: {
        with: {
            student: true,
        },
    },
    bookings: true,
};

// GET STUDENT PACKAGES WITH STATS
export async function getStudentPackagesWithStats(): Promise<ApiActionResponseModel<StudentPackageModel[]>> {
    try {
        const header = await getHeaderUsername();

        let schoolId: string | undefined;
        if (header) {
            const schoolData = await db.query.school.findFirst({
                where: eq(school.username, header),
            });
            if (!schoolData) {
                return { success: true, data: [] };
            }
            schoolId = schoolData.id;
        }

        // 1. Fetch all student packages with relations
        let packagesResult;
        try {
            packagesResult = await db.query.studentPackage.findMany({
                with: studentPackageWithRelations,
            });
        } catch (ormError) {
            console.error("ORM Error:", ormError);
            throw ormError;
        }

        // 2. Filter by school if schoolId provided (since studentPackage doesn't have direct schoolId field)
        const filteredPackages = schoolId
            ? packagesResult.filter(pkg => pkg.schoolPackage?.school?.id === schoolId)
            : packagesResult;

        // 3. Execute SQL stats
        let statsResult;
        try {
            statsResult = await db.execute(buildStudentPackageStatsQuery(schoolId));
        } catch (sqlError) {
            console.error("SQL Error:", sqlError);
            throw sqlError;
        }

        // 4. Create stats map for quick lookup
        const statsRows = Array.isArray(statsResult) ? statsResult : (statsResult as any).rows || [];
        const statsMap = createStatsMap(statsRows);

        // 5. Merge stats into models
        const packages: StudentPackageModel[] = filteredPackages.map((packageData) => ({
            ...createStudentPackageModel(packageData),
            stats: statsMap.get(packageData.id),
        }));

        return { success: true, data: packages };
    } catch (error) {
        console.error("Error fetching student packages with stats:", error);
        return { success: false, error: `Failed to fetch student packages: ${error instanceof Error ? error.message : String(error)}` };
    }
}

// CREATE - Student requests a package
export async function createStudentPackageRequest(requestData: StudentPackageForm): Promise<ApiActionResponseModel<StudentPackageModel>> {
    try {
        // Validate that the student and package exist
        const [studentExists, packageExists] = await Promise.all([db.select({ id: student.id }).from(student).where(eq(student.id, requestData.studentId)), db.select({ id: schoolPackage.id }).from(schoolPackage).where(eq(schoolPackage.id, requestData.packageId))]);

        if (studentExists.length === 0) {
            return { success: false, error: "Student not found" };
        }

        if (packageExists.length === 0) {
            return { success: false, error: "Package not found" };
        }

        // Check if student already has a request for this package
        const existingRequest = await db
            .select()
            .from(studentPackage)
            .where(and(eq(studentPackage.studentId, requestData.studentId), eq(studentPackage.packageId, requestData.packageId)));

        if (existingRequest.length > 0) {
            return { success: false, error: "Student already has a request for this package" };
        }

        const result = await db.insert(studentPackage).values(requestData).returning();
        revalidatePath("/students");
        revalidatePath("/schools");
        revalidatePath("/packages");

        return { success: true, data: createStudentPackageModel(result[0]) };
    } catch (error) {
        console.error("Error creating student package request:", error);
        return { success: false, error: "Failed to create package request" };
    }
}

// READ - Get all student package requests
export async function getStudentPackageRequests(): Promise<ApiActionResponseModel<StudentPackageModel[]>> {
    try {
        const header = await getHeaderUsername();

        let result: any[];
        if (header) {
            // Filter by school username - find school first, then filter packages
            const schoolWithUsername = await db.query.school.findFirst({
                where: eq(school.username, header),
                columns: { id: true },
            });

            if (schoolWithUsername) {
                // Get all student packages, then filter by school
                const allPackages = await db.query.studentPackage.findMany({
                    with: studentPackageWithRelations,
                });

                // Filter by school ID after fetching
                result = allPackages.filter((pkg) => pkg.schoolPackage?.school?.id === schoolWithUsername.id);
            } else {
                result = [];
            }
        } else {
            // Global query (admin mode)
            result = await db.query.studentPackage.findMany({
                with: studentPackageWithRelations,
            });
        }

        const studentPackages: StudentPackageModel[] = result.map((packageData) => createStudentPackageModel(packageData));
        return { success: true, data: studentPackages };
    } catch (error) {
        console.error("Error fetching student package requests:", error);
        return { success: false, error: "Failed to fetch package requests" };
    }
}

// READ - Get student package requests by student ID
export async function getStudentPackagesByStudentId(studentId: string): Promise<ApiActionResponseModel<StudentPackageModel[]>> {
    try {
        const result = await db.query.studentPackage.findMany({
            where: eq(studentPackage.studentId, studentId),
            with: studentPackageWithRelations,
        });

        const studentPackages: StudentPackageModel[] = result.map((packageData) => createStudentPackageModel(packageData));
        return { success: true, data: studentPackages };
    } catch (error) {
        console.error("Error fetching student packages:", error);
        return { success: false, error: "Failed to fetch student packages" };
    }
}

// READ - Get student package requests by school ID
export async function getStudentPackagesBySchoolId(schoolId: string): Promise<ApiActionResponseModel<StudentPackageModel[]>> {
    try {
        const header = await getHeaderUsername();

        let result;
        if (header) {
            // Filter by school username - find school first, then filter packages
            const schoolWithUsername = await db.query.school.findFirst({
                where: eq(school.username, header),
                columns: { id: true },
            });

            if (schoolWithUsername) {
                result = await db.query.studentPackage.findMany({
                    with: studentPackageWithRelations,
                });
                // Filter by school ID after fetching
                result = result.filter((pkg) => pkg.schoolPackage?.school?.id === schoolWithUsername.id);
            } else {
                result = [];
            }
        } else {
            // Use provided schoolId parameter
            result = await db.query.studentPackage.findMany({
                with: studentPackageWithRelations,
            });
            // Filter by school ID after fetching (since we need to check nested relation)
            result = result.filter((pkg) => pkg.schoolPackage?.school?.id === schoolId);
        }

        const studentPackages: StudentPackageModel[] = result.map((packageData) => createStudentPackageModel(packageData));
        return { success: true, data: studentPackages };
    } catch (error) {
        console.error("Error fetching student packages by school:", error);
        return { success: false, error: "Failed to fetch student packages" };
    }
}

// READ - Get single student package request
export async function getStudentPackageById(id: string): Promise<ApiActionResponseModel<StudentPackageModel>> {
    try {
        const result = await db.query.studentPackage.findFirst({
            where: eq(studentPackage.id, id),
            with: studentPackageWithRelations,
        });

        if (result) {
            return { success: true, data: createStudentPackageModel(result) };
        }
        return { success: false, error: "Student package request not found" };
    } catch (error) {
        console.error("Error fetching student package:", error);
        return { success: false, error: "Failed to fetch student package" };
    }
}

// UPDATE - Update student package request (mainly for status changes)
export async function updateStudentPackageRequest(id: string, updateData: Partial<StudentPackageForm>): Promise<ApiActionResponseModel<StudentPackageModel>> {
    try {
        const result = await db
            .update(studentPackage)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(studentPackage.id, id))
            .returning();

        if (result.length === 0) {
            return { success: false, error: "Student package request not found" };
        }

        revalidatePath("/students");
        revalidatePath("/schools");
        revalidatePath("/packages");

        return { success: true, data: createStudentPackageModel(result[0]) };
    } catch (error) {
        console.error("Error updating student package request:", error);
        return { success: false, error: "Failed to update package request" };
    }
}

// UPDATE - Accept student package request (school action)
export async function acceptStudentPackageRequest(id: string): Promise<ApiActionResponseModel<StudentPackageModel>> {
    return updateStudentPackageRequest(id, { status: "accepted" });
}

// UPDATE - Reject student package request (school action)
export async function rejectStudentPackageRequest(id: string): Promise<ApiActionResponseModel<StudentPackageModel>> {
    return updateStudentPackageRequest(id, { status: "rejected" });
}

// DELETE - Cancel student package request
export async function cancelStudentPackageRequest(id: string): Promise<ApiActionResponseModel<null>> {
    try {
        const result = await db.delete(studentPackage).where(eq(studentPackage.id, id)).returning();

        if (result.length === 0) {
            return { success: false, error: "Student package request not found" };
        }

        revalidatePath("/students");
        revalidatePath("/schools");
        revalidatePath("/packages");

        return { success: true, data: null };
    } catch (error) {
        console.error("Error canceling student package request:", error);
        return { success: false, error: "Failed to cancel package request" };
    }
}
