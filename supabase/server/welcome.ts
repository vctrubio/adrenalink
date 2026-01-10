"use server";

import { getServerConnection } from "@/supabase/connection";
import { revalidatePath } from "next/cache";
import type { ApiActionResponseModel } from "@/types/actions";

/**
 * Fetches all school usernames to prevent duplicates during registration
 */
export async function getSchoolsUsernames(): Promise<ApiActionResponseModel<string[]>> {
    try {
        const supabase = getServerConnection();

        const { data, error } = await supabase.from("school").select("username");

        if (error) {
            console.error("Error fetching school usernames:", error);
            return { success: false, error: "Failed to fetch school usernames" };
        }

        const usernames = (data || []).map((s: any) => s.username);
        return { success: true, data: usernames };
    } catch (error) {
        console.error("Unexpected error in getSchoolsUsernames:", error);
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
            console.error("Error checking username availability:", error);
            return { success: false, error: "Failed to check username availability" };
        }

        return { success: true, data: !data };
    } catch (error) {
        console.error("Unexpected error in checkUsernameAvailability:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Creates a new school record in the database
 */
export async function createSchool(schoolData: any): Promise<ApiActionResponseModel<any>> {
    try {
        const supabase = getServerConnection();

        // Map form data to database schema
        const insertData = {
            name: schoolData.name,
            username: schoolData.username.toLowerCase(),
            country: schoolData.country,
            phone: schoolData.phone,
            latitude: schoolData.latitude,
            longitude: schoolData.longitude,
            timezone: schoolData.timezone,
            google_place_id: schoolData.googlePlaceId,
            equipment_categories: schoolData.equipmentCategories, // Expecting comma-separated string from form
            owner_email: schoolData.ownerEmail,
            reference_note: schoolData.referenceNote,
            website_url: schoolData.websiteUrl,
            instagram_url: schoolData.instagramUrl,
            currency: schoolData.currency,
            wallet_id: schoolData.ownerId, // Mapping ownerId to wallet_id
            status: "pending",
        };

        const { data, error } = await supabase.from("school").insert(insertData).select().single();

        if (error) {
            console.error("Error creating school:", error);
            if (error.code === "23505") {
                return { success: false, error: "A school with this username already exists" };
            }
            return { success: false, error: error.message };
        }

        revalidatePath("/schools");
        return { success: true, data };
    } catch (error) {
        console.error("Unexpected error in createSchool:", error);
        return { success: false, error: "Failed to create school" };
    }
}
