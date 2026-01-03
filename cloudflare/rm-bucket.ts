import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

// Constants
const PROTECTED_PREFIX = "admin/";

// Remove all bucket contents except admin directory
async function removeBucketContents() {
    console.log("🗑️  Starting bucket cleanup (preserving admin directory)...");

    // Use SUDO credentials for admin operations
    const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const accessKeyId = process.env.SUDO_CLOUDFLARE_R2_ACCESS_KEY;
    const secretAccessKey = process.env.SUDO_CLOUDFLARE_R2_SECRET_KEY;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
        console.error("❌ Missing R2 SUDO environment variables!");
        console.error("Required: CLOUDFLARE_R2_ACCOUNT_ID, SUDO_CLOUDFLARE_R2_ACCESS_KEY, SUDO_CLOUDFLARE_R2_SECRET_KEY, CLOUDFLARE_R2_BUCKET");
        process.exit(1);
    }

    console.log("🔧 Using SUDO credentials for admin operations");
    console.log(`📍 Account ID: ${accountId}`);
    console.log(`🪣 Bucket: ${bucketName}`);
    console.log(`🛡️  Protected: ${PROTECTED_PREFIX}*`);

    // Create S3 client configured for Cloudflare R2 with SUDO credentials
    const r2Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });

    try {
        let deletedCount = 0;
        let protectedCount = 0;
        let continuationToken: string | undefined;

        do {
            // List all objects in the bucket
            console.log("📋 Listing bucket contents...");
            const listCommand = new ListObjectsV2Command({
                Bucket: bucketName,
                ContinuationToken: continuationToken,
                MaxKeys: 1000, // Process in batches
            });

            const listResult = await r2Client.send(listCommand);

            if (!listResult.Contents || listResult.Contents.length === 0) {
                console.log("✅ No more objects found");
                break;
            }

            console.log(`📄 Found ${listResult.Contents.length} objects to process`);

            // Process each object
            for (const object of listResult.Contents) {
                if (!object.Key) continue;

                // Skip admin directory objects
                if (object.Key.startsWith(PROTECTED_PREFIX)) {
                    console.log(`🛡️  Skipping protected: ${object.Key}`);
                    protectedCount++;
                    continue;
                }

                // Delete non-admin objects
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: bucketName,
                        Key: object.Key,
                    });

                    await r2Client.send(deleteCommand);
                    console.log(`🗑️  Deleted: ${object.Key}`);
                    deletedCount++;
                } catch (deleteError) {
                    console.error(`❌ Failed to delete ${object.Key}:`, deleteError);
                }
            }

            continuationToken = listResult.NextContinuationToken;
        } while (continuationToken);

        console.log("\n🎉 Bucket cleanup completed!");
        console.log(`✅ Objects deleted: ${deletedCount}`);
        console.log(`🛡️  Objects protected: ${protectedCount}`);

        // Show final bucket state
        console.log("\n📋 Final bucket contents:");
        const finalListCommand = new ListObjectsV2Command({
            Bucket: bucketName,
            MaxKeys: 50,
        });

        const finalResult = await r2Client.send(finalListCommand);

        if (finalResult.Contents && finalResult.Contents.length > 0) {
            finalResult.Contents.forEach((obj) => {
                console.log(`   📄 ${obj.Key} (${obj.Size} bytes)`);
            });
        } else {
            console.log("   🈳 Bucket is empty");
        }
    } catch (error) {
        console.error("❌ Bucket cleanup failed:");

        if (error instanceof Error) {
            console.error("Error message:", error.message);

            if (error.message.includes("SignatureDoesNotMatch")) {
                console.error("🔑 Issue: Invalid SUDO credentials - check Access Key and Secret Key");
            } else if (error.message.includes("NoSuchBucket")) {
                console.error("🪣 Issue: Bucket doesn't exist or wrong name");
            } else if (error.message.includes("AccessDenied")) {
                console.error("🚫 Issue: Insufficient permissions - ensure SUDO token has Admin Read & Write");
            } else {
                console.error("💥 Unexpected error:", error);
            }
        } else {
            console.error("💥 Unknown error:", error);
        }

        process.exit(1);
    }
}

// Run the cleanup
removeBucketContents();
