/**
 * Shared Clerk & Auth Utilities
 * 
 * Centralized configuration for authentication paths and helpers.
 */

export const PUBLIC_PATHS = [
    "/_next/",
    "/api/public/",
    "/discover",
    "/about",
    "/welcome",
    "/demo",
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
