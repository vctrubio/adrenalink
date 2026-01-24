import { NextRequest, NextResponse } from "next/server";
import printf from "../printf.js";
import { detectSubdomain } from "../types/domain";
import { getServerConnection } from "@/supabase/connection";
import { HEADER_KEYS, setHeader } from "@/types/header-constants";
import { logger } from "@/backend/logger";
import { getAuth } from "@clerk/nextjs/server";
import { isPublicPath } from "@/types/clerk-utils";

/**
 * Helper to construct discover redirect URL based on domain type
 * DRY approach - eliminates duplicate code
 */
function constructDiscoverUrl(
    request: NextRequest,
    type: "development" | "production"
): URL {
    const url = request.nextUrl.clone();
    url.hostname = type === "development" ? "www.lvh.me" : "www.adrenalink.tech";
    url.port = type === "development" ? "3000" : "";
    url.pathname = "/discover";
    return url;
}

/**
 * Helper to inject school headers into response
 */
function injectSchoolHeaders(
    response: NextResponse,
    schoolUsername: string,
    schoolId: string,
    timezone: string | null
): void {
    setHeader(response, HEADER_KEYS.SCHOOL_USERNAME, schoolUsername);
    setHeader(response, HEADER_KEYS.SCHOOL_ID, schoolId);
    if (timezone) {
        setHeader(response, HEADER_KEYS.SCHOOL_TIMEZONE, timezone);
    }
}

export async function proxy(request: NextRequest) {
    const hostname = request.headers.get("host") || "";
    const pathname = request.nextUrl.pathname;

    // Early return for public paths (no auth needed)
    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    printf("🚀 [REQUEST START]", {
        time: new Date().toISOString(),
        method: request.method,
        url: request.url,
        pathname,
        hostname,
    });
    try {

    // Redirect www root to /discover page
    if ((hostname === "www.lvh.me:3000" || hostname === "www.adrenalink.tech") && pathname === "/") {
        printf("DEV:DEBUG 🔄 REDIRECTING WWW ROOT TO /discover");
        return NextResponse.redirect(new URL("/discover", request.url));
    }

    // Check for subdomain using domain utilities
    const subdomainInfo = detectSubdomain(hostname);

    if (subdomainInfo) {
        printf("DEV:DEBUG ✅ SUBDOMAIN DETECTED:", subdomainInfo.subdomain);

        // Validate school exists (username is indexed via UNIQUE constraint)
        let schoolId: string | null = null;
        let timezone: string | null = null;
        try {
            const supabase = getServerConnection();
            printf("🔎 [Proxy] Looking up school for subdomain:", subdomainInfo.subdomain);
            
            const { data, error } = await supabase.from("school").select("id, timezone").eq("username", subdomainInfo.subdomain).single();

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
            printf(`✅ [Proxy] School found: ${schoolId}`);
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
        const { userId, sessionClaims } = getAuth(request);
        
        if (userId) {
            setHeader(response, HEADER_KEYS.USER_ID, userId);
            
            // Extract role/school from claims (session metadata)
            const metadata = (sessionClaims?.publicMetadata as any) || {};
            const role = metadata.role;
            const userSchoolId = metadata.schoolId;
            const isAuthorized = userSchoolId === schoolId;

            if (role) setHeader(response, HEADER_KEYS.USER_ROLE, role);
            setHeader(response, HEADER_KEYS.USER_AUTHORIZED, isAuthorized ? "true" : "false");

            printf("DEV:DEBUG 👤 SET USER HEADERS:", {
                userId,
                role,
                authorized: isAuthorized,
            });
        } else {
            printf("DEV:DEBUG ℹ️ NO USER AUTHENTICATED");
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
                setHeader(rewriteResponse, HEADER_KEYS.USER_ID, userId);
                setHeader(rewriteResponse, HEADER_KEYS.USER_AUTHORIZED, metadata.schoolId === schoolId ? "true" : "false");
            }
            return rewriteResponse;
        }

        return response;
    }

    return NextResponse.next();
    } finally {
        const date = new Date();
        const timestamp = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}:${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}:${date.getMilliseconds().toString().padStart(3, '0')}`;
        console.log({
            time: timestamp,
            method: request.method,
            hostname,
            user_agent: request.headers.get("user-agent"),
            url: request.url,
            ip: (request as any).ip || request.headers.get("x-forwarded-for"),
            user_cookie: request.cookies.get("user1")?.value ? request.cookies.get("user1")?.value.slice(0, 6) + "*****" : undefined,
            user_header: request.headers.get("user1")
        });
    }
}

// Matcher excludes static files, fonts, and images to reduce middleware invocations
// Next.js 16 optimization: Early returns in function are more efficient than complex matchers
export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|apple-touch-icon.png|robots.txt|sitemap.xml).*)"],
};

export default proxy;
