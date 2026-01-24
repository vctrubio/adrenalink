/**
 * Shared Clerk & Auth Utilities
 * 
 * Centralized configuration for authentication paths and helpers.
 */

// Paths that should SKIP the proxy middleware entirely (no DB lookup, no context)
export const PUBLIC_PATHS = [
    "/_next/",
    "/api/public/",
    "/discover", 
    /\.(js|css|woff|woff2|ttf|eot|svg|ico|png|jpg|jpeg|gif|webp)$/,
];

export function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some((path) => {
        if (path instanceof RegExp) {
            return path.test(pathname);
        }
        return pathname.startsWith(path);
    });
}
