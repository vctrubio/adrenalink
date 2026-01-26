"use server";

import { clerkClient } from "@clerk/nextjs/server";
import type { ClerkData } from "@/types/user";

export interface ClerkSearchResult extends ClerkData {
    fullName: string | null;
}

/**
 * Searches for Clerk users by name or email address.
 * Limited to 10 results for performance.
 */
export async function searchClerkUsers(query: string): Promise<{ success: boolean; data?: ClerkSearchResult[]; error?: string }> {
    if (!query || query.length < 2) {
        return { success: true, data: [] };
    }

    try {
        const client = await clerkClient();
        const { data: users } = await client.users.getUserList({
            query: query,
            limit: 10,
        });

        const results: ClerkSearchResult[] = users.map(user => ({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            imageUrl: user.imageUrl || "",
            fullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || null,
        }));

        return { success: true, data: results };
    } catch (error) {
        console.error("❌ Clerk Search Failed:", error);
        return { success: false, error: "Failed to search users" };
    }
}
