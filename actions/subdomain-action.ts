"use server";

import { db } from "@/drizzle/db";
import { schoolPackage, studentPackage, school } from "@/drizzle/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import { createSchoolModel } from "@/backend/models/SchoolModel";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

async function fetchSchoolAssets(schoolUsername: string): Promise<{ iconUrl: string | null; bannerUrl: string | null }> {
    try {
        const bucketName = process.env.CLOUDFLARE_R2_BUCKET;
        const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
        const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
        const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY;
        const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_KEY;

        if (!bucketName || !publicBaseUrl || !accountId || !accessKeyId || !secretAccessKey) {
            return { iconUrl: null, bannerUrl: null };
        }

        const s3Client = new S3Client({
            region: "auto",
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        let iconUrl: string | null = null;
        let bannerUrl: string | null = null;

        // Try school-specific icon
        const schoolIconPath = `${schoolUsername}/icon.png`;
        try {
            await s3Client.send(new HeadObjectCommand({
                Bucket: bucketName,
                Key: schoolIconPath,
            }));
            iconUrl = `${publicBaseUrl}/${schoolIconPath}`;
            console.log(`✅ Found school icon: ${schoolIconPath}`);
        } catch {
            // Try admin fallback
            const adminIconPath = "admin/icon.png";
            try {
                await s3Client.send(new HeadObjectCommand({
                    Bucket: bucketName,
                    Key: adminIconPath,
                }));
                iconUrl = `${publicBaseUrl}/${adminIconPath}`;
                console.log("✅ Using admin icon fallback");
            } catch {
                console.warn(`⚠️ No icon found for ${schoolUsername} or admin`);
                iconUrl = null;
            }
        }

        // Try school-specific banner (try both .png and .jpeg)
        const bannerExtensions = ["banner.png", "banner.jpeg", "banner.jpg"];
        for (const bannerFile of bannerExtensions) {
            const schoolBannerPath = `${schoolUsername}/${bannerFile}`;
            try {
                await s3Client.send(new HeadObjectCommand({
                    Bucket: bucketName,
                    Key: schoolBannerPath,
                }));
                bannerUrl = `${publicBaseUrl}/${schoolBannerPath}`;
                console.log(`✅ Found school banner: ${schoolBannerPath}`);
                break;
            } catch {
                // Try next extension
            }
        }

        // If no school banner found, try admin fallback
        if (!bannerUrl) {
            const adminBannerPath = "admin/banner.png";
            try {
                await s3Client.send(new HeadObjectCommand({
                    Bucket: bucketName,
                    Key: adminBannerPath,
                }));
                bannerUrl = `${publicBaseUrl}/${adminBannerPath}`;
                console.log("✅ Using admin banner fallback");
            } catch {
                console.warn(`⚠️ No banner found for ${schoolUsername} or admin`);
                bannerUrl = null;
            }
        }

        return { iconUrl, bannerUrl };
    } catch (error) {
        console.error("Error fetching school assets:", error);
        return { iconUrl: null, bannerUrl: null };
    }
}

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

        // Fetch assets from R2 bucket
        const assets = await fetchSchoolAssets(username);

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
                packages: packages,
                assets: assets
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
                currency: school.currency,
                equipmentCategories: school.equipmentCategories,
                status: school.status,
            })
            .from(school)
            .where(inArray(school.status, ["active", "pending"]));

        return { success: true, data: schools };
    } catch (error) {
        console.error("Error fetching all schools:", error);
        return { success: false, error: "Failed to fetch schools" };
    }
}
