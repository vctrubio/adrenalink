import { isUsernameReserved } from "@/config/predefinedNames";

export function generateUsername(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .slice(0, 30);
}

export function generateUsernameVariants(baseUsername: string, existingUsernames: string[]): string {
    // Normalize base username to lowercase for comparison
    const normalizedBase = baseUsername.toLowerCase();
    // Normalize existing usernames array for case-insensitive comparison
    const normalizedExisting = existingUsernames.map((u) => u?.toLowerCase() || "");

    if (!normalizedExisting.includes(normalizedBase) && !isUsernameReserved(normalizedBase)) {
        return normalizedBase;
    }

    for (let i = 1; i <= 999; i++) {
        const variant = `${normalizedBase}${i}`;
        if (!normalizedExisting.includes(variant) && !isUsernameReserved(variant)) {
            return variant;
        }
    }

    return `${normalizedBase}${Date.now().toString().slice(-6)}`;
}
