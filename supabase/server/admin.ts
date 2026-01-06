/**
 * Admin Server Functions
 * School credentials and admin-specific data fetching
 */

import { getServerConnection } from "@/supabase/connection";
import { getCDNImages } from "@/supabase/server/cdn";
import { headers } from "next/headers";
import type { SchoolCredentials } from "@/types/credentials";

export async function getSchoolCredentials(): Promise<SchoolCredentials | null> {
    try {
        const headersList = await headers();
        const schoolUsername = headersList.get("x-school-username");

        if (!schoolUsername) {
            console.error("❌ No school username in headers");
            return null;
        }

        const supabase = getServerConnection();

        // Fetch school from Supabase
        const { data: schoolData, error } = await supabase
            .from("school")
            .select("id, name, username, country, currency, status, timezone")
            .eq("username", schoolUsername)
            .single();

        if (error || !schoolData) {
            console.error("❌ Error fetching school:", error?.message || "School not found");
            return null;
        }

        // Fetch verified URLs from CDN
        const { bannerUrl, iconUrl } = await getCDNImages(schoolUsername);

        return {
            id: schoolData.id,
            logo: iconUrl,
            banner: bannerUrl,
            currency: schoolData.currency,
            name: schoolData.name,
            username: schoolData.username,
            status: schoolData.status,
            country: schoolData.country,
            timezone: schoolData.timezone,
            ownerId: "",
        } as SchoolCredentials;
    } catch (error) {
        console.error("❌ [ADMIN] Error fetching school credentials:", error);
        return null;
    }
}
