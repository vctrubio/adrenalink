import { getServerConnection } from "@/supabase/connection";
import { getCDNImages } from "@/supabase/server/cdn";
import type { SchoolWithAssets } from "@/supabase/db/types";
import { handleSupabaseError, safeArray } from "@/backend/error-handlers";
import { logger } from "@/backend/logger";

export async function getSchools(): Promise<SchoolWithAssets[]> {
    try {
        const supabase = getServerConnection();

        const { data: schools = [], error } = await supabase
            .from("school")
            .select("id, name, username, country, status, equipment_categories, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            logger.error("Error fetching schools", error);
            throw new Error(error.message);
        }

        // Fetch CDN URLs for each school using centralized function
        const schoolsWithAssets = await Promise.all(
            safeArray(schools).map(async (school) => {
                const { bannerUrl, iconUrl } = await getCDNImages(school.username);
                return {
                    ...school,
                    bannerUrl,
                    iconUrl,
                };
            }),
        );

        logger.info("Fetched schools", { count: schoolsWithAssets.length });
        return schoolsWithAssets as SchoolWithAssets[];
    } catch (err) {
        logger.error("Error fetching schools", err);
        throw err;
    }
}
