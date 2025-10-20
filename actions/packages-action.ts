"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/drizzle/db";
import { schoolPackage, school, type SchoolPackageForm, type SchoolPackageType } from "@/drizzle/schema";
import { createSchoolPackageModel, type SchoolPackageModel } from "@/backend/models";
import type { ApiActionResponseModel, ApiActionResponseModelArray } from "@/types/actions";

const schoolPackageWithRelations = {
    school: true,
    studentPackages: true,
    bookings: true
};

// CREATE
export async function createPackage(packageSchema: SchoolPackageForm) {
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
export async function getPackages(): Promise<ApiActionResponseModelArray<SchoolPackageType>> {
    try {
        const header = headers().get('x-school-username');
        
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
        
        if (result) {
            const packages: SchoolPackageModel[] = result.map(packageData => createSchoolPackageModel(packageData));
            return packages;
        }
        
        return { error: "No packages found" };
    } catch (error) {
        console.error("Error fetching packages:", error);
        return { error: "Failed to fetch packages" };
    }
}

export async function getPackageById(id: string): Promise<ApiActionResponseModel<SchoolPackageType>> {
    try {
        const result = await db.query.schoolPackage.findFirst({
            where: eq(schoolPackage.id, id),
            with: schoolPackageWithRelations
        });
        
        if (result) {
            return createSchoolPackageModel(result);
        }
        return { error: "Package not found" };
    } catch (error) {
        console.error("Error fetching package:", error);
        return { error: "Failed to fetch package" };
    }
}

export async function getPackagesBySchoolId(schoolId: string): Promise<ApiActionResponseModelArray<SchoolPackageType>> {
    try {
        const result = await db.query.schoolPackage.findMany({
            where: eq(schoolPackage.schoolId, schoolId),
            with: schoolPackageWithRelations
        });
        
        const packages: SchoolPackageModel[] = result.map(packageData => createSchoolPackageModel(packageData));
        
        return packages;
    } catch (error) {
        console.error("Error fetching packages by school ID:", error);
        return { error: "Failed to fetch packages" };
    }
}

// UPDATE
export async function updatePackage(id: string, packageSchema: Partial<SchoolPackageForm>) {
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
export async function deletePackage(id: string) {
    try {
        await db.delete(schoolPackage).where(eq(schoolPackage.id, id));
        revalidatePath("/packages");
        return { success: true };
    } catch (error) {
        console.error("Error deleting package:", error);
        return { success: false, error: "Failed to delete package" };
    }
}