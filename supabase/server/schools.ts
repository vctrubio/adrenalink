import { getServerConnection } from "@/supabase/connection";
import { getCDNImages } from "@/supabase/server/cdn";
import type { SchoolWithAssets } from "@/supabase/db/types";

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

        // Fetch CDN URLs for each school using centralized function
        const schoolsWithAssets = await Promise.all(
            schools.map(async (school) => {
                const { bannerUrl, iconUrl } = await getCDNImages(school.username);
                return {
                    ...school,
                    bannerUrl,
                    iconUrl,
                };
            })
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
