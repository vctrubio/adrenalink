import { headers } from "next/headers";
import { db } from "@/drizzle/db";
import { school } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Gets the x-school-username header value
 * @returns The school username from headers, or null if not present
 */
export async function getHeaderUsername(): Promise<string | null> {
    const headersList = await headers();
    return headersList.get("x-school-username");
}

/**
 * Gets the school name based on the x-school-username header
 * @returns The school name, or null if not found or header not present
 */
export async function getSchoolName(): Promise<string | null> {
    const username = await getHeaderUsername();

    if (!username) {
        return null;
    }

    try {
        const result = await db.query.school.findFirst({
            where: eq(school.username, username),
            columns: {
                name: true,
            },
        });

        return result?.name || null;
    } catch (error) {
        console.error("Error fetching school name:", error);
        return null;
    }
}