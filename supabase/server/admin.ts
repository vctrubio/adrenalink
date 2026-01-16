/**
 * Admin Server Functions
 * School credentials and admin-specific data fetching
 */

import { getServerConnection } from "@/supabase/connection";
import { getCDNImages } from "@/supabase/server/cdn";
import { headers } from "next/headers";
import type { SchoolCredentials } from "@/types/credentials";
import { logger } from "@/backend/logger";

export async function getSchoolCredentials(): Promise<SchoolCredentials | null> {
    try {
        const headersList = await headers();
        const schoolUsername = headersList.get("x-school-username");

        if (!schoolUsername) {
            logger.warn("No school username found in headers");
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
            logger.error("Failed to fetch school credentials", error, { schoolUsername });
            return null;
        }

        // --- VALIDATION ---
        const missingFields: string[] = [];
        if (!schoolData.timezone) missingFields.push("timezone");
        if (!schoolData.currency) missingFields.push("currency");
        if (!schoolData.wallet_id) missingFields.push("wallet_id");
        if (!schoolData.country) missingFields.push("country");
        if (!schoolData.status) missingFields.push("status");

        if (missingFields.length > 0) {
            logger.warn("Missing mandatory school configuration", { schoolUsername, missingFields });
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

        logger.info("Loaded school credentials", { schoolUsername, schoolId: schoolData.id });
        return credentials;
    } catch (error) {
        logger.error("Critical error loading school credentials", error);
        return null;
    }
}
