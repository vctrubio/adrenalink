import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/drizzle/db";
import { school } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import type { SchoolCredentials } from "@/types/credentials";

/**
 * Fetches school logo from R2
 * Tries school-specific logo first ({schoolUsername}/icon.png)
 * Falls back to admin logo (admin/icon.png)
 */
async function fetchLogoUrl(schoolUsername: string): Promise<string | null> {
    try {
        const bucketName = process.env.CLOUDFLARE_R2_BUCKET;
        const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
        const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
        const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY;
        const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_KEY;

        if (!bucketName || !publicBaseUrl || !accountId || !accessKeyId || !secretAccessKey) {
            return null;
        }

        const s3Client = new S3Client({
            region: "auto",
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        // Try to fetch school-specific logo first
        const schoolLogoPath = `${schoolUsername}/icon.png`;
        try {
            const headCommand = new HeadObjectCommand({
                Bucket: bucketName,
                Key: schoolLogoPath,
            });
            await s3Client.send(headCommand);
            return `${publicBaseUrl}/${schoolLogoPath}`;
        } catch {
            // School logo doesn't exist, try fallback to admin logo
        }

        // Fallback to admin logo
        const adminLogoPath = "admin/icon.png";
        try {
            const headCommand = new HeadObjectCommand({
                Bucket: bucketName,
                Key: adminLogoPath,
            });
            await s3Client.send(headCommand);
            return `${publicBaseUrl}/${adminLogoPath}`;
        } catch {
            // Admin logo doesn't exist either
            return null;
        }
    } catch (error) {
        console.error("Error fetching school logo:", error);
        return null;
    }
}

/**
 * Cached version of school logo fetch - revalidates every 43200 seconds (12 hours)
 */
const getCachedLogo = unstable_cache(
    async (schoolUsername: string) => fetchLogoUrl(schoolUsername),
    ["school-logo"],
    { revalidate: 43200, tags: ["school-logo"] }
);

/**
 * Cached version of school data fetch - revalidates every 43200 seconds (12 hours)
 */
const getCachedSchoolData = unstable_cache(
    async (schoolUsername: string) => {
        try {
            const result = await db.query.school.findFirst({
                where: eq(school.username, schoolUsername),
            });
            return result || null;
        } catch (error) {
            console.error(`Error fetching school by username "${schoolUsername}":`, error);
            return null;
        }
    },
    ["school-data"],
    { revalidate: 43200, tags: ["school-data"] }
);

/**
 * GET /api/school/credentials
 * Returns unified school credentials including logo, currency, username, status, and ownerId
 * Cached by Next.js for 1 hour
 */
export async function GET(request: Request) {
    try {
        const headersList = await headers();
        const schoolUsername = headersList.get("x-school-username");

        if (!schoolUsername) {
            return new Response(
                JSON.stringify({ error: "No school username in header" }),
                { status: 400 }
            );
        }

        // Fetch school data and logo in parallel
        const [schoolData, logoUrl] = await Promise.all([
            getCachedSchoolData(schoolUsername),
            getCachedLogo(schoolUsername),
        ]);

        if (!schoolData) {
            return new Response(
                JSON.stringify({ error: "School not found" }),
                { status: 404 }
            );
        }

        const credentials: SchoolCredentials = {
            logo: logoUrl,
            currency: schoolData.currency,
            username: schoolData.username,
            status: schoolData.status,
            ownerId: schoolData.ownerId,
        };

        // Cache for 12 hours with Next.js
        return new Response(
            JSON.stringify(credentials),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400",
                },
            }
        );
    } catch (error) {
        console.error("Error fetching school credentials:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500 }
        );
    }
}
