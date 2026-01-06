import { getServerConnection } from "@/supabase/connection";
import { School } from "@/supabase/db/types";

export async function getSchoolSubdomain(username: string) {
    try {
        const supabase = getServerConnection();
        
        const { data: school, error } = await supabase
            .from("school")
            .select("*")
            .eq("username", username)
            .single();

        if (error) {
            console.error(`❌ Error fetching school "${username}":`, error);
            throw new Error(error.message);
        }

        if (!school) {
            console.warn(`⚠️ School not found: ${username}`);
            return { success: false, error: "School not found" };
        }

        console.log(`✅ Fetched school: ${school.name}`);

        return {
            success: true,
            data: {
                school,
                packages: [],
                assets: { iconUrl: null, bannerUrl: null },
            },
        };
    } catch (err) {
        console.error(`💥 getSchoolSubdomain("${username}") failed:`, err);
        return { success: false, error: String(err) };
    }
}
