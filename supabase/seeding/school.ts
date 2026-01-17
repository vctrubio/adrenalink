/**
 * School Seeding
 *
 * Create school records with specific credentials
 */

import { supabase } from "./client";

export interface SchoolInput {
    name: string;
    username: string;
    country: string;
    phone: string;
    status?: string;
    currency?: string;
    latitude?: string;
    longitude?: string;
    timezone?: string;
    website_url?: string;
    instagram_url?: string;
    email?: string;
    clerk_id?: string;
}

export const createSchool = async (input: SchoolInput) => {
    const { data, error } = await supabase
        .from("school")
        .insert([
            {
                // wallet_id removed
                name: input.name,
                username: input.username,
                country: input.country,
                phone: input.phone,
                status: input.status || "beta",
                currency: input.currency || "EUR",
                latitude: input.latitude,
                longitude: input.longitude,
                timezone: input.timezone,
                website_url: input.website_url,
                instagram_url: input.instagram_url,
                email: input.email || `${input.username}@example.com`,
                clerk_id: input.clerk_id || `user_${crypto.randomUUID()}`,
            },
        ])
        .select()
        .single();

    if (error) throw error;
    console.log(`✅ Created school: ${data.name} (${data.username})`);
    return data;
};
