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
        console.log("🔵 API: Starting upload process...");
        const formData = await request.formData();
        const username = formData.get("username") as string;
        const iconFile = formData.get("iconFile") as File | null;
        const bannerFile = formData.get("bannerFile") as File | null;
        const metadataString = formData.get("metadata") as string | null;

        console.log(`🔵 API: Username: ${username}, Icon: ${iconFile?.name}, Banner: ${bannerFile?.name}`);

        if (!username) {
            console.log("❌ API: No username provided");
            return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }

        console.log("🔵 API: Getting R2 client...");
        const r2Client = getR2Client();
        const bucketName = process.env.CLOUDFLARE_R2_BUCKET || "adrenalink-assets";

        console.log(`🔵 API: Using bucket: ${bucketName}`);
        const uploadResults: string[] = [];

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
                uploadResults.push("icon");
            } else {
                return NextResponse.json({ error: `Icon upload failed with status: ${iconResult.$metadata.httpStatusCode}` }, { status: 500 });
            }
        }

        // Upload banner if provided
        if (bannerFile && bannerFile.size > 0) {
            const bannerBuffer = await bannerFile.arrayBuffer();
            const bannerKey = `${username}/banner.png`;

            const bannerUploadCommand = new PutObjectCommand({
                Bucket: bucketName,
                Key: bannerKey,
                Body: new Uint8Array(bannerBuffer),
                ContentType: bannerFile.type,
                ContentLength: bannerFile.size,
            });

            const bannerResult = await r2Client.send(bannerUploadCommand);

            if (bannerResult.$metadata.httpStatusCode === 200) {
                uploadResults.push("banner");
            } else {
                return NextResponse.json({ error: `Banner upload failed with status: ${bannerResult.$metadata.httpStatusCode}` }, { status: 500 });
            }
        }

        // Upload metadata.json if provided
        if (metadataString) {
            const metadataKey = `${username}/metadata.json`;

            const metadataUploadCommand = new PutObjectCommand({
                Bucket: bucketName,
                Key: metadataKey,
                Body: metadataString,
                ContentType: "application/json",
                ContentLength: Buffer.byteLength(metadataString, "utf8"),
            });

            const metadataResult = await r2Client.send(metadataUploadCommand);

            if (metadataResult.$metadata.httpStatusCode !== 200) {
                console.warn(`Metadata upload failed with status: ${metadataResult.$metadata.httpStatusCode}`);
                // Don't fail the whole upload if metadata fails
            }
        }

        console.log(`✅ API: Upload successful! Results: ${uploadResults.join(", ")}`);
        return NextResponse.json({
            success: true,
            uploaded: uploadResults,
        });
    } catch (error) {
        console.error("❌ API: R2 upload error:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Upload failed",
                success: false,
            },
            { status: 500 },
        );
    }
}
