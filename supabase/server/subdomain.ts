import { getServerConnection } from "@/supabase/connection";
import { getCDNImages } from "@/supabase/server/cdn";
import type { School, SchoolPackage } from "@/supabase/db/types";
import { logger } from "@/backend/logger";

export interface SchoolAssets {
    bannerUrl: string;
    iconUrl: string;
}

export interface SchoolWithPackages {
    school: School;
    packages: SchoolPackage[];
    assets: SchoolAssets;
}

/**
 * Fetch school for subdomain with all packages (single query with join)
 * Username is indexed via UNIQUE constraint in schema
 */
export async function getSchool4Subdomain(username: string): Promise<SchoolWithPackages | null> {
    try {
        const supabase = getServerConnection();

        const { data, error } = await supabase.from("school").select("*, school_package(*)").eq("username", username).single();

        if (error) {
            logger.error(`Error fetching school by username`, { username, error });
            return null;
        }

        if (!data) {
            logger.warn("School not found", { username });
            return null;
        }

        const school = data as School;
        const packages: SchoolPackage[] = (data as School & { school_package: SchoolPackage[] }).school_package || [];

        // Fetch both asset URLs in one go
        const { bannerUrl, iconUrl } = await getCDNImages(username);

        logger.info("Fetched school with packages", {
            schoolName: school.name,
            packageCount: packages.length,
            bannerUrl,
            iconUrl,
        });

        return {
            school,
            packages,
            assets: { bannerUrl, iconUrl },
        };
    } catch (err) {
        logger.error("Failed to fetch school by username", err, { username });
        return null;
    }
}
