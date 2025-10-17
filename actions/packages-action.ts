"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { schoolPackage, type SchoolPackageForm, type SchoolPackageType } from "@/drizzle/schema";
import { SchoolPackageModel } from "@/backend/models";
import type { ApiActionResponseModel, ApiActionResponseModelArray } from "@/types/actions";

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
        const result = await db.query.schoolPackage.findMany({
            with: {
                school: true
            }
        });
        
        const packages: SchoolPackageModel[] = result.map(packageData => {
            const { school, ...pureSchema } = packageData;
            const packageModel = new SchoolPackageModel(pureSchema);
            
            // Map relations from query result
            packageModel.relations = {
                school: school
            };
            
            return packageModel;
        });
        
        return packages;
    } catch (error) {
        console.error("Error fetching packages:", error);
        return { error: "Failed to fetch packages" };
    }
}

export async function getPackageById(id: string): Promise<ApiActionResponseModel<SchoolPackageType>> {
    try {
        const result = await db.query.schoolPackage.findFirst({
            where: eq(schoolPackage.id, id),
            with: {
                school: true
            }
        });
        
        if (result) {
            const { school, ...pureSchema } = result;
            const packageModel = new SchoolPackageModel(pureSchema);
            
            // Map relations from query result
            packageModel.relations = {
                school: school
            };
            
            return packageModel;
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
            with: {
                school: true
            }
        });
        
        const packages: SchoolPackageModel[] = result.map(packageData => {
            const { school, ...pureSchema } = packageData;
            const packageModel = new SchoolPackageModel(pureSchema);
            
            // Map relations from query result
            packageModel.relations = {
                school: school
            };
            
            return packageModel;
        });
        
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