"use server";

import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

async function fetchSchoolAssets(schoolUsername: string): Promise<{ iconUrl: string | null; bannerUrl: string | null }> {
    const startTime = Date.now();
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

        // Helper to check if a key exists
        const checkExists = async (key: string) => {
            try {
                await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
                return true;
            } catch {
                return false;
            }
        };

        // 1. Check icon (school-specific then admin fallback)
        const iconPaths = [`${schoolUsername}/icon.png`, "admin/icon.png"];

        // 2. Check banners in parallel
        const bannerExtensions = ["banner.png", "banner.jpeg", "banner.jpg"];
        const schoolBannerPaths = bannerExtensions.map((ext) => `${schoolUsername}/${ext}`);
        const adminBannerPath = "admin/banner.png";

        // We can fire all checks in parallel
        const [iconResults, bannerResults, adminBannerExists] = await Promise.all([Promise.all(iconPaths.map(checkExists)), Promise.all(schoolBannerPaths.map(checkExists)), checkExists(adminBannerPath)]);

        // Resolve icon
        let iconUrl: string | null = null;
        if (iconResults[0]) iconUrl = `${publicBaseUrl}/${iconPaths[0]}`;
        else if (iconResults[1]) iconUrl = `${publicBaseUrl}/${iconPaths[1]}`;

        // Resolve banner
        let bannerUrl: string | null = null;
        const foundBannerIndex = bannerResults.findIndex((exists) => exists);
        if (foundBannerIndex !== -1) {
            bannerUrl = `${publicBaseUrl}/${schoolBannerPaths[foundBannerIndex]}`;
        } else if (adminBannerExists) {
            bannerUrl = `${publicBaseUrl}/${adminBannerPath}`;
        }

        console.log(`⏱️ [fetchSchoolAssets] Completed in ${Date.now() - startTime}ms`);
        return { iconUrl, bannerUrl };
    } catch (error) {
        console.error("Error fetching school assets:", error);
        return { iconUrl: null, bannerUrl: null };
    }
}

import { unstable_cache } from "next/cache";
import { getSchoolAssets } from "@/getters/cdn-getter";
import { getServerConnection } from "@/supabase/connection";

// Cache school assets for 1 hour
const getCachedSchoolAssets = unstable_cache(async (username: string) => fetchSchoolAssets(username), ["school-assets"], { revalidate: 3600, tags: ["school-assets"] });

// Cache school data for 1 hour
const getCachedSchoolByUsername = unstable_cache(
    async (username: string) => {
        const supabase = getServerConnection();
        const { data, error } = await supabase
            .from("school")
            .select("*")
            .eq("username", username)
            .single();
        
        if (error) throw error;
        return data;
    },
    ["school-by-username"],
    { revalidate: 3600, tags: ["school"] },
);

export async function getSchoolSubdomain(username: string) {
    const startTime = Date.now();
    console.log(`🔍 [getSchoolSubdomain] Starting fetch for: ${username}`);

    try {
        // Step 1: Fetch school data and assets in parallel (Cached)
        const [schoolResult, assets] = await Promise.all([
            getCachedSchoolByUsername(username).catch((e) => {
                console.error("❌ [getSchoolSubdomain] Error fetching school:", e);
                throw e;
            }),
            getCachedSchoolAssets(username),
        ]);

        console.log(`⏱️ [getSchoolSubdomain] Base data fetched in ${Date.now() - startTime}ms`);

        if (!schoolResult) {
            console.warn(`⚠️ [getSchoolSubdomain] School not found: ${username}`);
            return { success: false, error: "School not found" };
        }

        // Step 2: Fetch public packages with booking counts (Keep this fresh or short-lived cache)
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
            .where(and(eq(schoolPackage.schoolId, schoolResult.id), eq(schoolPackage.active, true), eq(schoolPackage.isPublic, true)))
            .groupBy(schoolPackage.id);

        console.log(`⏱️ [getSchoolSubdomain] Total fetch completed in ${Date.now() - startTime}ms`);

        const schoolModel = createSchoolModel(schoolResult);

        return {
            success: true,
            data: {
                school: schoolModel,
                packages: packages,
                assets: assets,
            },
        };
    } catch (error) {
        console.error("💥 [getSchoolSubdomain] Critical error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch school subdomain",
        };
    }
}

// Cache all schools list with their assets for 1 hour
const getCachedAllSchoolsWithAssets = unstable_cache(
    async () => {
        const schoolsData = await db.query.school.findMany({
            columns: {
                name: true,
                username: true,
                country: true,
                equipmentCategories: true,
            },
            where: (school, { inArray }) => inArray(school.status, ["active", "pending"]),
        });

        return Promise.all(
            schoolsData.map(async (s) => {
                const assets = await getSchoolAssets(s.username);
                const categories = s.equipmentCategories ? s.equipmentCategories.split(",").map((c) => c.trim().toLowerCase()) : [];

                return {
                    name: s.name,
                    username: s.username,
                    country: s.country,
                    categories,
                    iconUrl: assets.iconUrl || "/ADR.webp",
                    bannerUrl: assets.bannerUrl || "/beach-banner.jpg",
                };
            }),
        );
    },
    ["all-schools-with-assets"],
    { revalidate: 3600, tags: ["school", "school-assets"] },
);

export async function getAllSchools() {
    try {
        const schools = await getCachedAllSchoolsWithAssets();
        return { success: true, data: schools };
    } catch (error) {
        console.error("Error fetching all schools:", error);
        return { success: false, error: "Failed to fetch schools" };
    }
}
