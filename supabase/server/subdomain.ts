import { getServerConnection } from "@/supabase/connection";
import { getCDNImages } from "@/supabase/server/cdn";
import type { School, SchoolPackage } from "@/supabase/db/types";

export interface SchoolAssets {
    banner: string;
    logo: string;
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

        const { data, error } = await supabase
            .from("school")
            .select("*, school_package(*)")
            .eq("username", username)
            .single();

        if (error) {
            console.error(`❌ Error fetching school by username "${username}":`, error);
            return null;
        }

        if (!data) {
            console.warn(`⚠️ School not found: ${username}`);
            return null;
        }

        const school = data as School;
        const packages: SchoolPackage[] = (data as School & { school_package: SchoolPackage[] }).school_package || [];
        
        // Fetch both asset URLs in one go
        const { bannerUrl, iconUrl } = await getCDNImages(username);

        console.log(`✅ Fetched school "${school.name}" with ${packages.length} packages`);
        console.log(`   Assets: banner=${bannerUrl}, icon=${iconUrl}`);

        return {
            school,
            packages,
            assets: { banner: bannerUrl, logo: iconUrl },
        };
    } catch (err) {
        console.error(`💥 getSchoolByUsername("${username}") failed:`, err);
        return null;
    }
}


