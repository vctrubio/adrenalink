import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client
 * Use this for all server-side operations (Server Actions, API routes, etc)
 * 
 * Note: This uses anon key for row-level security. 
 * If you need service role access, import from supabase/server/index.ts
 */
export function createServerClient(): SupabaseClient {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
}

/**
 * Singleton server client instance for reuse across requests
 */
let supabaseInstance: SupabaseClient | null = null;

export function getServerClient(): SupabaseClient {
    if (!supabaseInstance) {
        supabaseInstance = createServerClient();
    }
    return supabaseInstance;
}
