"use server";

import { getServerConnection } from "@/supabase/connection";
import { revalidatePath } from "next/cache";
import type { ApiActionResponseModel } from "@/types/actions";
import { logAndNotifyNewSchool, logAndNotifyError } from "./notifications";
import { sendSchoolRegistrationEmail } from "./email-service";
import { logger } from "@/backend/logger";
import { isUniqueConstraintError, safeArray } from "@/backend/error-handlers";

/**
 * Fetches all school usernames to prevent duplicates during registration
 */
export async function getSchoolsUsernames(): Promise<ApiActionResponseModel<string[]>> {
    try {
        const supabase = getServerConnection();

        const { data, error } = await supabase.from("school").select("username");

        if (error) {
            logger.error("Error fetching school usernames", error);
            // We don't notify admin for this minor read error to avoid spam
            return { success: false, error: "Failed to fetch school usernames" };
        }

        const usernames = safeArray(data).map((s: any) => s.username);
        return { success: true, data: usernames };
    } catch (error) {
        logger.error("Unexpected error in getSchoolsUsernames", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Checks if a specific username is available
 */
export async function checkUsernameAvailability(username: string): Promise<ApiActionResponseModel<boolean>> {
    try {
        const supabase = getServerConnection();

        const { data, error } = await supabase.from("school").select("id").eq("username", username.toLowerCase()).maybeSingle();

        if (error) {
            logger.error("Error checking username availability", error);
            return { success: false, error: "Failed to check username availability" };
        }

        return { success: true, data: !data };
    } catch (error) {
        logger.error("Unexpected error in checkUsernameAvailability", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Creates a new school record in the database
 */
export async function createSchool(schoolData: any): Promise<ApiActionResponseModel<any>> {
    try {
        const supabase = getServerConnection();

        // Normalize username to lowercase and trim whitespace
        const normalizedUsername = schoolData.username?.toLowerCase().trim() || "";

        // Double-check username availability right before insert to catch race conditions
        const { data: existingSchool } = await supabase
            .from("school")
            .select("id")
            .eq("username", normalizedUsername)
            .maybeSingle();

        if (existingSchool) {
            return { success: false, error: "A school with this username already exists" };
        }

        // Map form data to database schema
        const insertData = {
            name: schoolData.name,
            username: normalizedUsername,
            country: schoolData.country,
            phone: schoolData.phone,
            latitude: schoolData.latitude,
            longitude: schoolData.longitude,
            timezone: schoolData.timezone,
            google_place_id: schoolData.googlePlaceId,
            equipment_categories: schoolData.equipmentCategories, // Expecting comma-separated string from form
            website_url: schoolData.websiteUrl,
            instagram_url: schoolData.instagramUrl,
            currency: schoolData.currency,
            email: schoolData.email,
            clerk_id: schoolData.clerkId || null, // Allow null for welcome form submissions
            status: "pending",
        };

        const { data, error } = await supabase.from("school").insert(insertData).select().single();

        if (error) {
            if (isUniqueConstraintError(error)) {
                // Check which unique constraint was violated
                if (error.message?.includes("clerk_id")) {
                    return { success: false, error: "A school with this clerk ID already exists" };
                }
                if (error.message?.includes("username")) {
                    return { success: false, error: "A school with this username already exists" };
                }
                return { success: false, error: "A school with this information already exists" };
            }
            
            // Log critical DB error
            await logAndNotifyError("createSchool:DatabaseInsert", error);
            
            return { success: false, error: error.message };
        }

        // Success! Notify Admin via WhatsApp
        // Fire and forget so UI doesn't hang
        logAndNotifyNewSchool(data, schoolData.ownerEmail, schoolData.referenceNote).catch(err => 
            logger.error("Failed to fire notification", err)
        );

        // Send Welcome Email (Fire and forget)
        sendSchoolRegistrationEmail(data, schoolData.ownerEmail).catch(err => 
            logger.error("Failed to send welcome email", err)
        );

        revalidatePath("/schools");
        return { success: true, data };
    } catch (error) {
        // Log critical unexpected error
        await logAndNotifyError("createSchool:Unexpected", error);
        return { success: false, error: "Failed to create school" };
    }
}
