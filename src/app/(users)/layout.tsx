import { type ReactNode } from "react";
import { headers } from "next/headers";
import { SchoolCredentialsProvider } from "@/src/providers/school-credentials-provider";
import NavAdrBar from "@/src/components/NavAdrBar";
import NavIns from "@/src/components/NavIns";
import type { SchoolCredentials } from "@/types/credentials";
import { db } from "@/drizzle/db";
import { school } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

interface UsersLayoutProps {
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

async function getSchoolCredentials(): Promise<SchoolCredentials | null> {
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
            username: schoolData.username,
            status: schoolData.status,
            ownerId: schoolData.ownerId,
        };
    } catch (error) {
        console.error("Error fetching school credentials:", error);
        return null;
    }
}

export default async function UsersLayout({ children }: UsersLayoutProps) {
    const credentials = await getSchoolCredentials();

    return (
        <SchoolCredentialsProvider credentials={credentials}>
            <NavAdrBar />
            <main className="pt-24 pb-20 md:pb-32 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
            </main>
            <NavIns />
        </SchoolCredentialsProvider>
    );
}
