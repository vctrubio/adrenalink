"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { getHeaderUsername, getSchoolIdFromHeader } from "@/types/headers";
import { schoolPackage, school, type SchoolPackageForm, type SchoolPackageType } from "@/drizzle/schema";
import { createSchoolPackageModel, type SchoolPackageModel, type SchoolPackageUpdateForm } from "@/backend/models";
import { buildSchoolPackageStatsQuery, createStatsMap } from "@/getters/databoard-sql-stats";
import type { ApiActionResponseModel } from "@/types/actions";

const schoolPackageWithRelations = {
    school: true,
    studentPackages: true,
};

// GET SCHOOL PACKAGES WITH STATS
export async function getSchoolPackagesWithStats(): Promise<ApiActionResponseModel<SchoolPackageModel[]>> {
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

        // 1. Fetch school packages with relations
        let packagesResult;
        try {
            packagesResult = schoolId
                ? await db.query.schoolPackage.findMany({
                      where: eq(schoolPackage.schoolId, schoolId),
                      with: schoolPackageWithRelations,
                  })
                : await db.query.schoolPackage.findMany({
                      with: schoolPackageWithRelations,
                  });
        } catch (ormError) {
            console.error("ORM Error:", ormError);
            throw ormError;
        }

        // 2. Execute SQL stats
        let statsResult;
        try {
            statsResult = await db.execute(buildSchoolPackageStatsQuery(schoolId));
        } catch (sqlError) {
            console.error("SQL Error:", sqlError);
            throw sqlError;
        }

        // 3. Create stats map for quick lookup
        const statsRows = Array.isArray(statsResult) ? statsResult : (statsResult as any).rows || [];
        const statsMap = createStatsMap(statsRows);

        // 4. Merge stats into models
        const packages: SchoolPackageModel[] = packagesResult.map((packageData) => ({
            ...createSchoolPackageModel(packageData),
            stats: statsMap.get(packageData.id),
        }));

        console.log("getSchoolPackagesWithStats created packages:", packages);

        return { success: true, data: packages };
    } catch (error) {
        console.error("Error fetching school packages with stats:", error);
        return { success: false, error: `Failed to fetch school packages: ${error instanceof Error ? error.message : String(error)}` };
    }
}

// CREATE
export async function createPackage(packageSchema: SchoolPackageForm): Promise<ApiActionResponseModel<SchoolPackageType>> {
    try {
        const result = await db.insert(schoolPackage).values(packageSchema).returning();
        revalidatePath("/packages");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error creating package:", error);
        return { success: false, error: "Failed to create package" };
    }
}

// READ
export async function getPackages(): Promise<ApiActionResponseModel<SchoolPackageModel[]>> {
    try {
        const header = await getHeaderUsername();
        
        let result;
        if (header) {
            // Filter packages by school username - need to use a join approach
            const schoolWithUsername = await db.query.school.findFirst({
                where: eq(school.username, header),
                columns: { id: true }
            });
            
            if (schoolWithUsername) {
                result = await db.query.schoolPackage.findMany({
                    where: eq(schoolPackage.schoolId, schoolWithUsername.id),
                    with: schoolPackageWithRelations
                });
            } else {
                result = [];
            }
        } else {
            // Global query (admin mode)
            result = await db.query.schoolPackage.findMany({
                with: schoolPackageWithRelations
            });
        }
        
        const packages: SchoolPackageModel[] = result.map(packageData => createSchoolPackageModel(packageData));
        return { success: true, data: packages };
    } catch (error) {
        console.error("Error fetching packages:", error);
        return { success: false, error: "Failed to fetch packages" };
    }
}

export async function getPackageById(id: string): Promise<ApiActionResponseModel<SchoolPackageModel>> {
    try {
        const result = await db.query.schoolPackage.findFirst({
            where: eq(schoolPackage.id, id),
            with: schoolPackageWithRelations
        });
        
        if (result) {
            return { success: true, data: createSchoolPackageModel(result) };
        }
        return { success: false, error: "Package not found" };
    } catch (error) {
        console.error("Error fetching package:", error);
        return { success: false, error: "Failed to fetch package" };
    }
}

export async function getPackagesBySchoolId(schoolId: string): Promise<ApiActionResponseModel<SchoolPackageModel[]>> {
    try {
        const result = await db.query.schoolPackage.findMany({
            where: eq(schoolPackage.schoolId, schoolId),
            with: schoolPackageWithRelations
        });
        
        const packages: SchoolPackageModel[] = result.map(packageData => createSchoolPackageModel(packageData));
        
        return { success: true, data: packages };
    } catch (error) {
        console.error("Error fetching packages by school ID:", error);
        return { success: false, error: "Failed to fetch packages" };
    }
}

// UPDATE
export async function updatePackage(id: string, packageSchema: Partial<SchoolPackageForm>): Promise<ApiActionResponseModel<SchoolPackageType>> {
    try {
        const result = await db.update(schoolPackage).set(packageSchema).where(eq(schoolPackage.id, id)).returning();
        revalidatePath("/packages");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error updating package:", error);
        return { success: false, error: "Failed to update package" };
    }
}

// DELETE
export async function deletePackage(id: string): Promise<ApiActionResponseModel<null>> {
    try {
        await db.delete(schoolPackage).where(eq(schoolPackage.id, id));
        revalidatePath("/packages");
        return { success: true, data: null };
    } catch (error) {
        console.error("Error deleting package:", error);
        return { success: false, error: "Failed to delete package" };
    }
}

// UPDATE SCHOOL PACKAGE WITH SCHOOL CONTEXT
export async function updateSchoolPackageDetail(
    data: SchoolPackageUpdateForm,
): Promise<ApiActionResponseModel<SchoolPackageModel>> {
    try {
        const schoolId = await getSchoolIdFromHeader();
        if (!schoolId) {
            return { success: false, error: "School context not found" };
        }

        // Verify package belongs to the school
        const packageData = await db.query.schoolPackage.findFirst({
            where: eq(schoolPackage.id, data.id),
        });

        if (!packageData) {
            return { success: false, error: "Package not found" };
        }

        if (packageData.schoolId !== schoolId) {
            return { success: false, error: "You do not have permission to edit this package" };
        }

        // Update school package table
        await db.update(schoolPackage).set({
            description: data.description,
            durationMinutes: data.durationMinutes,
            pricePerStudent: data.pricePerStudent,
            capacityStudents: data.capacityStudents,
            capacityEquipment: data.capacityEquipment,
            categoryEquipment: data.categoryEquipment,
            packageType: data.packageType,
            isPublic: data.isPublic,
            active: data.active,
        }).where(eq(schoolPackage.id, data.id));

        revalidatePath(`/packages/${data.id}`);

        // Fetch and return updated package
        const result = await db.query.schoolPackage.findFirst({
            where: eq(schoolPackage.id, data.id),
            with: {
                school: true,
                studentPackages: true,
            },
        });

        if (!result) {
            return { success: false, error: "Package not found after update" };
        }

        return { success: true, data: createSchoolPackageModel(result) };
    } catch (error) {
        console.error("Error updating package:", error);
        return { success: false, error: "Failed to update package" };
    }
}