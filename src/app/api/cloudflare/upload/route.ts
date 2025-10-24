import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// R2 client configuration
const getR2Client = () => {
    const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
        throw new Error("Missing Cloudflare R2 environment variables");
    }

    return new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const username = formData.get("username") as string;
        const iconFile = formData.get("iconFile") as File | null;
        const bannerFile = formData.get("bannerFile") as File | null;

        if (!username) {
            return NextResponse.json(
                { error: "Username is required" },
                { status: 400 }
            );
        }

        const r2Client = getR2Client();
        const bucketName = process.env.CLOUDFLARE_R2_BUCKET || "adrenalink-assets";
        const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
        
        const results: { iconUrl?: string; bannerUrl?: string } = {};

        // Upload icon if provided
        if (iconFile && iconFile.size > 0) {
            const iconBuffer = await iconFile.arrayBuffer();
            const iconKey = `${username}/icon.png`;

            const iconUploadCommand = new PutObjectCommand({
                Bucket: bucketName,
                Key: iconKey,
                Body: new Uint8Array(iconBuffer),
                ContentType: iconFile.type,
                ContentLength: iconFile.size,
            });

            const iconResult = await r2Client.send(iconUploadCommand);
            
            if (iconResult.$metadata.httpStatusCode === 200) {
                results.iconUrl = `${publicBaseUrl}/${iconKey}`;
            } else {
                return NextResponse.json(
                    { error: `Icon upload failed with status: ${iconResult.$metadata.httpStatusCode}` },
                    { status: 500 }
                );
            }
        }

        // Upload banner if provided
        if (bannerFile && bannerFile.size > 0) {
            const bannerBuffer = await bannerFile.arrayBuffer();
            const bannerKey = `${username}/banner.jpeg`;

            const bannerUploadCommand = new PutObjectCommand({
                Bucket: bucketName,
                Key: bannerKey,
                Body: new Uint8Array(bannerBuffer),
                ContentType: bannerFile.type,
                ContentLength: bannerFile.size,
            });

            const bannerResult = await r2Client.send(bannerUploadCommand);
            
            if (bannerResult.$metadata.httpStatusCode === 200) {
                results.bannerUrl = `${publicBaseUrl}/${bannerKey}`;
            } else {
                return NextResponse.json(
                    { error: `Banner upload failed with status: ${bannerResult.$metadata.httpStatusCode}` },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({
            success: true,
            ...results
        });

    } catch (error) {
        console.error("R2 upload error:", error);
        return NextResponse.json(
            { 
                error: error instanceof Error ? error.message : "Upload failed",
                success: false
            },
            { status: 500 }
        );
    }
}