import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Get Supabase client for server-side operations
 * (Server components, server actions, API routes)
 */
export function getServerConnection(): SupabaseClient {
    return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

let clientInstance: SupabaseClient | null = null;

/**
 * Get Supabase client for client-side operations
 * (Client components, browser context)
 */
export function getClientConnection(): SupabaseClient {
    if (!clientInstance) {
        clientInstance = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return clientInstance;
}
