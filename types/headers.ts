import { headers } from "next/headers";

/**
 * Gets the x-school-username header value
 * @returns The school username from headers, or null if not present
 */
export async function getHeaderUsername(): Promise<string | null> {
    const headersList = await headers();
    return headersList.get("x-school-username");
}