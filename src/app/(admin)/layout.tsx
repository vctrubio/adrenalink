import { type ReactNode } from "react";
import { headers } from "next/headers";
import { SchoolTeachersProvider } from "@/src/providers/school-teachers-provider";
import { SchoolCredentialsProvider } from "@/src/providers/school-credentials-provider";
import FacebookNav from "@/src/components/navigations/FacebookNav";
import type { SchoolCredentials } from "@/types/credentials";
import { db } from "@/drizzle/db";
import { school } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

interface AdminLayoutProps {
    children: ReactNode;
}

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
            await s3Client.send(
                new HeadObjectCommand({
                    Bucket: bucketName,
                    Key: schoolLogoPath,
                }),
            );
            return `${publicBaseUrl}/${schoolLogoPath}`;
        } catch {
            // Try fallback
        }

        const adminLogoPath = "admin/icon.png";
        try {
            await s3Client.send(
                new HeadObjectCommand({
                    Bucket: bucketName,
                    Key: adminLogoPath,
                }),
            );
            return `${publicBaseUrl}/${adminLogoPath}`;
        } catch {
            return null;
        }
    } catch (error) {
        console.error("Error fetching school logo:", error);
        return null;
    }
}

async function getSchoolCredentials(): Promise<SchoolCredentials | null> {
    const startTime = Date.now();
    try {
        const headersList = await headers();
        const schoolUsername = headersList.get("x-school-username");

        console.log("🔍 [LAYOUT] Starting getSchoolCredentials for:", schoolUsername);

        if (!schoolUsername) {
            console.log("❌ [LAYOUT] No school username header found");
            return null;
        }

        const dbQueryStart = Date.now();
        console.log("🗄️ [LAYOUT] Starting database query for school:", schoolUsername);

        const schoolData = await db.query.school.findFirst({
            where: eq(school.username, schoolUsername),
        });

        const dbQueryDuration = Date.now() - dbQueryStart;
        console.log("✅ [LAYOUT] Database query completed in:", `${dbQueryDuration}ms`);

        if (!schoolData) {
            console.log("❌ [LAYOUT] School not found in database");
            return null;
        }

        const logoFetchStart = Date.now();
        const logoUrl = await fetchLogoUrl(schoolUsername);
        const logoFetchDuration = Date.now() - logoFetchStart;
        console.log("✅ [LAYOUT] Logo fetch completed in:", `${logoFetchDuration}ms`);

        const totalDuration = Date.now() - startTime;
        console.log("🎉 [LAYOUT] getSchoolCredentials completed in:", `${totalDuration}ms`);

        return {
            logo: logoUrl,
            currency: schoolData.currency,
            username: schoolData.username,
            status: schoolData.status,
            ownerId: schoolData.ownerId,
        };
    } catch (error) {
        const totalDuration = Date.now() - startTime;
        console.error("💥 [LAYOUT] Error fetching school credentials after:", `${totalDuration}ms`, error);
        return null;
    }
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const credentials = await getSchoolCredentials();

    return (
        <SchoolCredentialsProvider credentials={credentials}>
            <SchoolTeachersProvider>
                <div className="flex flex-col h-screen bg-background">
                    <FacebookNav />
                    <div className="">
                        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
                    </div>
                </div>
            </SchoolTeachersProvider>
        </SchoolCredentialsProvider>
    );
}
