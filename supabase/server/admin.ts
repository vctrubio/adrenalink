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
            console.error("❌ [getSchoolCredentials] No school username found in headers (x-school-username)");
            return null;
        }

        const supabase = getServerConnection();

        // Fetch school from Supabase
        const { data: schoolData, error } = await supabase
            .from("school")
            .select("id, name, username, country, currency, status, timezone, wallet_id")
            .eq("username", schoolUsername)
            .single();

        if (error || !schoolData) {
            console.error(`❌ [getSchoolCredentials] DB lookup failed for "${schoolUsername}":`, error?.message || "School not found");
            return null;
        }

        // --- VALIDATION ---
        const missingFields: string[] = [];
        if (!schoolData.timezone) missingFields.push("timezone");
        if (!schoolData.currency) missingFields.push("currency");
        if (!schoolData.wallet_id) missingFields.push("wallet_id (ownerId)");
        if (!schoolData.country) missingFields.push("country");
        if (!schoolData.status) missingFields.push("status");

        if (missingFields.length > 0) {
            console.error(`❌ [getSchoolCredentials] Missing mandatory configuration for "${schoolUsername}":`, missingFields.join(", "));
            // We return null to trigger the /no-credentials redirect if anything critical is missing
            return null;
        }

        // Fetch verified URLs from CDN (guaranteed to return fallbacks if custom missing)
        const { bannerUrl, iconUrl } = await getCDNImages(schoolUsername);

        const credentials: SchoolCredentials = {
            id: schoolData.id,
            logoUrl: iconUrl,
            bannerUrl: bannerUrl,
            currency: schoolData.currency,
            name: schoolData.name,
            username: schoolData.username,
            status: schoolData.status,
            country: schoolData.country,
            timezone: schoolData.timezone,
            ownerId: schoolData.wallet_id,
        };

        console.log(`✅ [getSchoolCredentials] Successfully loaded credentials for "${schoolUsername}"`);
        return credentials;
    } catch (error) {
        console.error("❌ [getSchoolCredentials] Critical error:", error);
        return null;
    }
}
