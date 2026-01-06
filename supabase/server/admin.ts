/**
 * Admin Server Functions
 * School credentials and admin-specific data fetching
 */

import { getServerConnection } from "@/supabase/connection";
import type { School } from "@/supabase/db/types";

/**
 * Check if a CDN image exists via HEAD request
 */
async function getCDNImageUrl(username: string, imageType: "banner" | "icon"): Promise<string | null> {
    const customUrl = `https://cdn.adrenalink.tech/${username}/${imageType}.png`;
    const adminUrl = `https://cdn.adrenalink.tech/admin/${imageType}.png`;

    try {
        const response = await fetch(customUrl, { method: "HEAD" });
        if (response.ok) {
            return customUrl;
        }
    } catch (err) {
        console.warn(`⚠️ Failed to check ${imageType} for ${username}`);
    }

    // Try admin fallback
    try {
        const response = await fetch(adminUrl, { method: "HEAD" });
        if (response.ok) {
            return adminUrl;
        }
    } catch (err) {
        console.warn(`⚠️ Failed to check admin ${imageType}`);
    }

    return null;
}

export async function getSchoolCredentials(schoolUsername: string) {
    try {
        if (!schoolUsername) {
            console.error("❌ No school username provided");
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

        // Fetch logo URL
        const logoUrl = await getCDNImageUrl(schoolUsername, "icon");

        return {
            id: schoolData.id,
            logo: logoUrl,
            currency: schoolData.currency,
            name: schoolData.name,
            username: schoolData.username,
            status: schoolData.status,
            country: schoolData.country,
            timezone: schoolData.timezone,
        };
    } catch (error) {
        console.error("❌ [ADMIN] Error fetching school credentials:", error);
        return null;
    }
}
