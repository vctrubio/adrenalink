import { getServerConnection } from "@/supabase/connection";
import type { SchoolWithAssets } from "@/supabase/db/types";

/**
 * Check if a CDN image exists via HEAD request
 */
async function getCDNImageUrl(username: string, imageType: "banner" | "icon"): Promise<string> {
    const customUrl = `https://cdn.adrenalink.tech/${username}/${imageType}.png`;
    const adminUrl = `https://cdn.adrenalink.tech/admin/${imageType}.png`;

    try {
        const response = await fetch(customUrl, { method: "HEAD" });
        if (response.ok) {
            return customUrl;
        }
    } catch (err) {
        console.warn(`⚠️ Failed to check ${imageType} for ${username}, using /admin/ fallback`);
    }

    return adminUrl;
}

export async function getSchools(): Promise<SchoolWithAssets[]> {
    try {
        const supabase = getServerConnection();
        
        const { data: schools = [], error } = await supabase
            .from("school")
            .select("id, name, username, country, status, equipment_categories, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("❌ Error fetching schools:", error);
            throw new Error(error.message);
        }

        // Fetch CDN URLs for each school (check custom first, fallback to /admin/)
        const schoolsWithAssets = await Promise.all(
            schools.map(async (school) => ({
                ...school,
                bannerUrl: await getCDNImageUrl(school.username, "banner"),
                iconUrl: await getCDNImageUrl(school.username, "icon"),
            }))
        );

        // Log schools with equipment_categories for debugging
        console.log("✅ Fetched schools:", schoolsWithAssets.length);
        schoolsWithAssets.forEach(s => {
            console.log(`  ${s.name}: categories=${s.equipment_categories || "EMPTY"}`);
        });
        
        return schoolsWithAssets as SchoolWithAssets[];
    } catch (err) {
        console.error("💥 getSchools() failed:", err);
        throw err;
    }
}
