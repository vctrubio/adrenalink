import { getServerConnection } from "@/supabase/connection";
import { School } from "@/supabase/db/types";

export async function getSchools(): Promise<School[]> {
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

        console.log("✅ Fetched schools:", schools.length);
        return schools as School[];
    } catch (err) {
        console.error("💥 getSchools() failed:", err);
        throw err;
    }
}
