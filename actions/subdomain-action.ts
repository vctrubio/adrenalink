"use server";

import { db } from "@/drizzle/db";
import { schoolPackage, studentPackage, school } from "@/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { createSchoolModel } from "@/backend/models/SchoolModel";

// DRY: Standard school relations query
const schoolWithRelations = {
    schoolStudents: {
        with: {
            student: true,
        },
    },
    schoolPackages: true,
    bookings: {
        with: {
            studentPackage: {
                with: {
                    schoolPackage: true,
                },
            },
        },
    },
};

export async function getSchoolSubdomain(username: string) {
    try {
        // Get school by username
        const schoolResult = await db.query.school.findFirst({
            where: eq(school.username, username),
            with: schoolWithRelations,
        });

        if (!schoolResult) {
            return { success: false, error: "School not found" };
        }

        const schoolModel = createSchoolModel(schoolResult);

        // Fetch public packages
        const packages = await db
            .select({
                id: schoolPackage.id,
                durationMinutes: schoolPackage.durationMinutes,
                description: schoolPackage.description,
                pricePerStudent: schoolPackage.pricePerStudent,
                capacityStudents: schoolPackage.capacityStudents,
                capacityEquipment: schoolPackage.capacityEquipment,
                categoryEquipment: schoolPackage.categoryEquipment,
                packageType: schoolPackage.packageType,
                schoolId: schoolPackage.schoolId,
                isPublic: schoolPackage.isPublic,
                active: schoolPackage.active,
                createdAt: schoolPackage.createdAt,
                updatedAt: schoolPackage.updatedAt,
                bookingCount: sql<number>`CAST(COUNT(${studentPackage.id}) AS INTEGER)`,
            })
            .from(schoolPackage)
            .leftJoin(studentPackage, eq(studentPackage.schoolPackageId, schoolPackage.id))
            .where(
                and(
                    eq(schoolPackage.schoolId, schoolResult.id),
                    eq(schoolPackage.active, true),
                    eq(schoolPackage.isPublic, true)
                )
            )
            .groupBy(schoolPackage.id);

        return { 
            success: true, 
            data: {
                school: schoolModel,
                packages: packages
            }
        };
    } catch (error) {
        console.error("Error fetching school subdomain:", error);
        return { success: false, error: "Failed to fetch school subdomain" };
    }
}

export async function getAllSchools() {
    try {
        const schools = await db
            .select({
                id: school.id,
                name: school.name,
                username: school.username,
                country: school.country,
                status: school.status,
            })
            .from(school)
            .where(eq(school.status, "active"));

        return { success: true, data: schools };
    } catch (error) {
        console.error("Error fetching all schools:", error);
        return { success: false, error: "Failed to fetch schools" };
    }
}
