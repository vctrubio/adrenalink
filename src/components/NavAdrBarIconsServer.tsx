import { headers } from "next/headers";
import { db } from "@/drizzle/db";
import { school } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { LeftIcons, RightIcons } from "./NavAdrBarIcons";
import type { SchoolCredentials } from "@/types/credentials";

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

        const schoolLogoPath = `${schoolUsername}/icon.png`;
        try {
            await s3Client.send(new HeadObjectCommand({
                Bucket: bucketName,
                Key: schoolLogoPath,
            }));
            return `${publicBaseUrl}/${schoolLogoPath}`;
        } catch {
            // Try fallback
        }

        const adminLogoPath = "admin/icon.png";
        try {
            await s3Client.send(new HeadObjectCommand({
                Bucket: bucketName,
                Key: adminLogoPath,
            }));
            return `${publicBaseUrl}/${adminLogoPath}`;
        } catch {
            return null;
        }
    } catch (error) {
        console.error("Error fetching school logo:", error);
        return null;
    }
}

export async function getSchoolCredentials(): Promise<SchoolCredentials | null> {
    try {
        const headersList = await headers();
        const schoolUsername = headersList.get("x-school-username");

        if (!schoolUsername) {
            return null;
        }

        const schoolData = await db.query.school.findFirst({
            where: eq(school.username, schoolUsername),
        });

        if (!schoolData) {
            return null;
        }

        const logoUrl = await fetchLogoUrl(schoolUsername);

        return {
            logo: logoUrl,
            currency: schoolData.currency,
            name: schoolData.name,
            username: schoolData.username,
            status: schoolData.status,
            ownerId: schoolData.ownerId,
            country: schoolData.country,
            timezone: schoolData.timezone,
        };
    } catch (error) {
        console.error("Error fetching school credentials:", error);
        return null;
    }
}

export async function LeftIconsServer() {
    const credentials = await getSchoolCredentials();
    return <LeftIcons credentials={credentials} />;
}

export async function RightIconsServer() {
    const credentials = await getSchoolCredentials();
    return <RightIcons credentials={credentials} />;
}
