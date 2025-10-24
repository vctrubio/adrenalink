import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

// Constants for admin school assets
const ADMIN_USERNAME = "admin";

// Get admin bucket asset URLs
async function getAdminBucketAssets() {
    console.log("🔍 Checking admin school assets...");
    
    // R2 credentials from environment
    const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_KEY;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET;
    const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
    
    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicBaseUrl) {
        console.error("❌ Missing R2 environment variables!");
        console.error("Required: CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY, CLOUDFLARE_R2_SECRET_KEY, CLOUDFLARE_R2_BUCKET, CLOUDFLARE_R2_PUBLIC_URL");
        process.exit(1);
    }
    
    // Create S3 client configured for Cloudflare R2
    const r2Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });

    const results: { iconUrl?: string; bannerUrl?: string; iconExists: boolean; bannerExists: boolean } = {
        iconExists: false,
        bannerExists: false
    };

    try {
        // Check admin icon
        const iconKey = `${ADMIN_USERNAME}/icon.png`;
        try {
            const iconHead = new HeadObjectCommand({
                Bucket: bucketName,
                Key: iconKey,
            });
            
            const iconResult = await r2Client.send(iconHead);
            if (iconResult.$metadata.httpStatusCode === 200) {
                results.iconUrl = `${publicBaseUrl}/${iconKey}`;
                results.iconExists = true;
                console.log(`✅ Admin icon found: ${results.iconUrl}`);
            }
        } catch (error) {
            console.log("❌ Admin icon not found");
            results.iconExists = false;
        }

        // Check admin banner
        const bannerKey = `${ADMIN_USERNAME}/banner.png`;
        try {
            const bannerHead = new HeadObjectCommand({
                Bucket: bucketName,
                Key: bannerKey,
            });
            
            const bannerResult = await r2Client.send(bannerHead);
            if (bannerResult.$metadata.httpStatusCode === 200) {
                results.bannerUrl = `${publicBaseUrl}/${bannerKey}`;
                results.bannerExists = true;
                console.log(`✅ Admin banner found: ${results.bannerUrl}`);
            }
        } catch (error) {
            console.log("❌ Admin banner not found");
            results.bannerExists = false;
        }

        // Output JSON result
        console.log("\n📋 Admin Assets Summary:");
        console.log(JSON.stringify(results, null, 2));
        
        return results;
        
    } catch (error) {
        console.error("❌ Error checking admin assets:", error);
        process.exit(1);
    }
}

// Run the check
getAdminBucketAssets();