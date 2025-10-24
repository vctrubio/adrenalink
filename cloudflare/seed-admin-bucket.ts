import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
config({ path: ".env.local" });

// Constants for admin school assets
const ADMIN_USERNAME = "admin";
const ICON_PATH = join(process.cwd(), "public/branding/Icon.png");
const BANNER_PATH = join(process.cwd(), "public/branding/Banner.png");

// Upload admin school assets
async function uploadAdminAssets(r2Client: S3Client, bucketName: string) {
    const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
    
    try {
        // Upload admin icon
        console.log("📤 Uploading admin icon...");
        const iconBuffer = readFileSync(ICON_PATH);
        const iconKey = `${ADMIN_USERNAME}/icon.png`;
        
        const iconUploadCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: iconKey,
            Body: iconBuffer,
            ContentType: "image/png",
            ContentLength: iconBuffer.length,
        });
        
        const iconResult = await r2Client.send(iconUploadCommand);
        
        if (iconResult.$metadata.httpStatusCode === 200) {
            console.log(`✅ Admin icon uploaded: ${publicBaseUrl}/${iconKey}`);
        } else {
            console.error(`❌ Icon upload failed with status: ${iconResult.$metadata.httpStatusCode}`);
        }
        
        // Upload admin banner
        console.log("📤 Uploading admin banner...");
        const bannerBuffer = readFileSync(BANNER_PATH);
        const bannerKey = `${ADMIN_USERNAME}/banner.png`;
        
        const bannerUploadCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: bannerKey,
            Body: bannerBuffer,
            ContentType: "image/png",
            ContentLength: bannerBuffer.length,
        });
        
        const bannerResult = await r2Client.send(bannerUploadCommand);
        
        if (bannerResult.$metadata.httpStatusCode === 200) {
            console.log(`✅ Admin banner uploaded: ${publicBaseUrl}/${bannerKey}`);
        } else {
            console.error(`❌ Banner upload failed with status: ${bannerResult.$metadata.httpStatusCode}`);
        }
        
        console.log("🎉 Admin assets uploaded successfully!");
        
    } catch (error) {
        console.error("❌ Error uploading admin assets:", error);
        throw error;
    }
}

// Test R2 bucket connection and upload
async function testR2Bucket() {
    console.log("🧪 Testing Cloudflare R2 bucket connection...");
    
    // R2 credentials from environment
    const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_KEY;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET;
    
    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
        console.error("❌ Missing R2 environment variables!");
        console.error("Required: CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY, CLOUDFLARE_R2_SECRET_KEY, CLOUDFLARE_R2_BUCKET");
        process.exit(1);
    }
    
    console.log("🔧 Using credentials from .env.local");
    console.log(`📍 Account ID: ${accountId}`);
    console.log(`🪣 Bucket: ${bucketName}`);
    
    // Create S3 client configured for Cloudflare R2
    const r2Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });

    try {
        // Test 1: List bucket contents
        console.log("📋 Testing bucket listing...");
        const listCommand = new ListObjectsV2Command({
            Bucket: bucketName,
            MaxKeys: 10,
        });
        
        const listResult = await r2Client.send(listCommand);
        console.log(`✅ Bucket accessible! Found ${listResult.Contents?.length || 0} objects`);
        
        // Test 2: Upload a test file
        console.log("📤 Testing file upload...");
        const testContent = JSON.stringify({
            test: true,
            timestamp: new Date().toISOString(),
            message: "Hello from Adrenalink test!"
        }, null, 2);
        
        const uploadCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: "test/hello-world.json",
            Body: testContent,
            ContentType: "application/json",
        });
        
        const uploadResult = await r2Client.send(uploadCommand);
        console.log("✅ File uploaded successfully!");
        console.log("📍 ETag:", uploadResult.ETag);
        
        // Test 3: List again to confirm upload
        console.log("📋 Listing bucket contents after upload...");
        const listAfterUpload = await r2Client.send(listCommand);
        console.log(`✅ Now found ${listAfterUpload.Contents?.length || 0} objects`);
        
        if (listAfterUpload.Contents) {
            listAfterUpload.Contents.forEach(obj => {
                console.log(`   📄 ${obj.Key} (${obj.Size} bytes)`);
            });
        }
        
        console.log("🎉 R2 bucket test completed successfully!");
        console.log(`🔗 Test file URL: https://pub-${accountId}.r2.dev/${bucketName}/test/hello-world.json`);
        
        // Upload admin school assets
        console.log("🏫 Uploading admin school assets...");
        await uploadAdminAssets(r2Client, bucketName);
        
    } catch (error) {
        console.error("❌ R2 bucket test failed:");
        
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            
            if (error.message.includes("SignatureDoesNotMatch")) {
                console.error("🔑 Issue: Invalid credentials - check Access Key and Secret Key");
            } else if (error.message.includes("NoSuchBucket")) {
                console.error("🪣 Issue: Bucket doesn't exist or wrong name");
            } else if (error.message.includes("AccessDenied")) {
                console.error("🚫 Issue: Insufficient permissions on API token");
            } else {
                console.error("💥 Unexpected error:", error);
            }
        } else {
            console.error("💥 Unknown error:", error);
        }
        
        process.exit(1);
    }
}

// Run the test
testR2Bucket();