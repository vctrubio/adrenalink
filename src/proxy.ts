import { NextRequest, NextResponse } from "next/server";
import printf from "../printf.js";
import { detectSubdomain } from "../types/domain";
import { getServerConnection } from "@/supabase/connection";
import { HEADER_KEYS, setHeader } from "@/types/header-constants";
import { logger } from "@/backend/logger";
import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Shared Clerk & Auth Utilities
 *
 * Centralized configuration for authentication paths and helpers.
 */

// Paths that should SKIP the proxy middleware entirely (no DB lookup, no context)
export const PUBLIC_PATHS = ["/_next/", "/api/public/", "/discover", /\.(js|css|woff|woff2|ttf|eot|svg|ico|png|jpg|jpeg|gif|webp)$/];

// Simple in-memory cache for school lookups
// Key: subdomain, Value: { id: string, timezone: string | null, timestamp: number }
const SCHOOL_CACHE = new Map<string, { id: string; timezone: string | null; timestamp: number }>();
const CACHE_TTL = 60 * 1000 * 5; // 5 minutes

export function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some((path) => {
        if (path instanceof RegExp) {
            return path.test(pathname);
        }
        return pathname.startsWith(path);
    });
}

function isPrefetch(request: NextRequest): boolean {
    const purpose = request.headers.get("purpose");
    const secFetchPurpose = request.headers.get("sec-fetch-purpose");
    const nextRouterPrefetch = request.headers.get("next-router-prefetch");
    
    return (
        purpose === "prefetch" ||
        secFetchPurpose === "prefetch" ||
        nextRouterPrefetch === "1"
    );
}

/**
 * Helper to construct discover redirect URL based on domain type
 * DRY approach - eliminates duplicate code
 */
function constructDiscoverUrl(request: NextRequest, type: "development" | "production"): URL {
    const url = request.nextUrl.clone();
    url.hostname = type === "development" ? "www.lvh.me" : "www.adrenalink.tech";
    url.port = type === "development" ? "3000" : "";
    url.pathname = "/discover";
    return url;
}

/**
 * Helper to inject school headers into response
 */
function injectSchoolHeaders(response: NextResponse, schoolUsername: string, schoolId: string, timezone: string | null): void {
    setHeader(response, HEADER_KEYS.SCHOOL_USERNAME, schoolUsername);
    setHeader(response, HEADER_KEYS.SCHOOL_ID, schoolId);
    if (timezone) {
        setHeader(response, HEADER_KEYS.SCHOOL_TIMEZONE, timezone);
    }
}

async function customProxy(authObject: any, request: NextRequest) {
    const hostname = request.headers.get("host") || "";
    const pathname = request.nextUrl.pathname;

    // Early return for public paths (no auth/context needed)
    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    const isPrefetchRequest = isPrefetch(request);

    if (!isPrefetchRequest) {
        console.log(`//////////////////////////////// STARTING: ${pathname} //////////////////////////////`);
    }

    printf(isPrefetchRequest ? "🚀 [PREFETCH]" : "🚀 [REQUEST START]", {
        time: new Date().toISOString(),
        method: request.method,
        url: request.url,
        pathname,
        hostname,
    });
    let schoolId: string | null = null;
    try {
        // Redirect www root to /discover page
        if ((hostname === "www.lvh.me:3000" || hostname === "www.adrenalink.tech") && pathname === "/") {
            printf("DEV:DEBUG 🔄 REDIRECTING WWW ROOT TO /discover");
            return NextResponse.redirect(new URL("/discover", request.url));
        }

        // Check for subdomain using domain utilities
        const subdomainInfo = detectSubdomain(hostname);

        if (subdomainInfo) {
            if (!isPrefetchRequest) {
                printf("DEV:DEBUG ✅ SUBDOMAIN DETECTED:", subdomainInfo.subdomain);
            }

            // Validate school exists (username is indexed via UNIQUE constraint)
            let timezone: string | null = null;
            try {
                // Check cache first
                const cached = SCHOOL_CACHE.get(subdomainInfo.subdomain);
                const now = Date.now();

                if (cached && (now - cached.timestamp < CACHE_TTL)) {
                    if (!isPrefetchRequest) printf("⚡ [Proxy] Cache hit for subdomain:", subdomainInfo.subdomain);
                    schoolId = cached.id;
                    timezone = cached.timezone;
                } else {
                    const supabase = getServerConnection();
                    if (!isPrefetchRequest) printf("🔎 [Proxy] Looking up school for subdomain:", subdomainInfo.subdomain);

                    const { data, error } = await supabase
                        .from("school")
                        .select("id, timezone")
                        .eq("username", subdomainInfo.subdomain)
                        .single();

                    if (error) {
                        printf("❌ [Proxy] School lookup DB error:", error);
                    }

                    if (!data?.id) {
                        printf(`⚠️ [Proxy] School not found: ${subdomainInfo.subdomain}`);
                        logger.warn("School not found for subdomain", { subdomain: subdomainInfo.subdomain });
                        const discoverUrl = constructDiscoverUrl(request, subdomainInfo.type);
                        return NextResponse.redirect(discoverUrl);
                    }

                    schoolId = data.id;
                    timezone = data.timezone;
                    
                    // Update cache
                    SCHOOL_CACHE.set(subdomainInfo.subdomain, { id: schoolId!, timezone, timestamp: now });
                    printf(`✅ [Proxy] School found: ${schoolId}`);
                }
            } catch (error) {
                printf("💥 [Proxy] School lookup exception:", error);
                logger.error("School lookup failed", error, { subdomain: subdomainInfo.subdomain });
                const discoverUrl = constructDiscoverUrl(request, subdomainInfo.type);
                return NextResponse.redirect(discoverUrl);
            }

            // Create response with school headers
            const response = NextResponse.next();
            injectSchoolHeaders(response, subdomainInfo.subdomain, schoolId!, timezone);

            // Clerk Auth Integration
            // We use the auth object passed by clerkMiddleware
            const { userId, sessionClaims } = authObject;

            if (userId) {
                setHeader(response, HEADER_KEYS.USER_ID, userId);

                // Extract role for THIS specific school from mapped metadata
                const metadata = (sessionClaims?.publicMetadata as any) || {};
                const schools = metadata.schools || {};
                const context = schools[schoolId!];
                
                const role = context?.role;
                const isAuthorized = !!role;

                if (role) setHeader(response, HEADER_KEYS.USER_ROLE, role);
                setHeader(response, HEADER_KEYS.USER_AUTHORIZED, isAuthorized ? "true" : "false");
            } else {
                if (!isPrefetchRequest) printf("DEV:DEBUG ℹ️ NO USER AUTHENTICATED");
            }

            // Rewrite subdomain root requests to portal
            if (request.nextUrl.pathname === "/") {
                const url = request.nextUrl.clone();
                url.pathname = "/subdomain";

                printf("🔄 REWRITING TO:", url.toString());
                const rewriteResponse = NextResponse.rewrite(url);
                injectSchoolHeaders(rewriteResponse, subdomainInfo.subdomain, schoolId!, timezone);

                if (userId) {
                    const metadata = (sessionClaims?.publicMetadata as any) || {};
                    const schools = metadata.schools || {};
                    const isAuthorized = !!schools[schoolId!];
                    
                    setHeader(rewriteResponse, HEADER_KEYS.USER_ID, userId);
                    setHeader(rewriteResponse, HEADER_KEYS.USER_AUTHORIZED, isAuthorized ? "true" : "false");
                }
                return rewriteResponse;
            }

            return response;
        }

        return NextResponse.next();
    } finally {
        // Skip verbose logging for prefetches
        if (!isPrefetchRequest) {
            const date = new Date();
            const timestamp = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}:${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}:${date.getMilliseconds().toString().padStart(3, "0")}`;
            console.log({
                time: timestamp,
                method: request.method,
                hostname,
                user_agent: request.headers.get("user-agent"),
                url: request.url,
                ip_private: (request as any).ip || request.headers.get("x-forwarded-for"),
                ip_public: request.headers.get("CF-Connecting-IP"), // Proxied from CloudFlare
                school_id: schoolId,
                user_id: authObject?.userId
            });
        }
    }
}

export default clerkMiddleware(async (auth, req) => {
    return customProxy(await auth(), req);
});

// Matcher excludes static files, fonts, and images to reduce middleware invocations
export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|apple-touch-icon.png|robots.txt|sitemap.xml).*)"],
};
