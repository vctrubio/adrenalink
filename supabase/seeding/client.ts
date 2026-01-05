/**
 * Supabase Client Setup for Seeding
 * 
 * Provides a singleton instance of the Supabase client
 * with service role key for seeding operations
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
