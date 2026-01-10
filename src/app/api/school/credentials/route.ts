import { getSchoolCredentials } from "@/supabase/server/admin";
import type { SchoolCredentials } from "@/types/credentials";

/**
 * GET /api/school/credentials
 * Returns unified school credentials including logo, currency, username, status, and ownerId
 * Uses the centralized getSchoolCredentials server function
 */
export async function GET(request: Request) {
    try {
        const credentials = await getSchoolCredentials();

        if (!credentials) {
            return new Response(JSON.stringify({ error: "School credentials not found or incomplete" }), { status: 404 });
        }

        // Cache for 12 hours with Next.js headers
        return new Response(JSON.stringify(credentials), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        console.error("Error fetching school credentials via API:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
