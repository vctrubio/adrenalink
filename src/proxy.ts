import { NextRequest, NextResponse } from "next/server";
import printf from "../printf.js";
import { detectSubdomain } from "../types/domain";

export function proxy(request: NextRequest) {
    const hostname = request.headers.get("host") || "";
    const pathname = request.nextUrl.pathname;

    // console.log("REQUEST HIT:");
    //         return NextResponse.next();


    // Early return for common assets and internal routes
    // Reduces unnecessary processing and logging for requests that don't need subdomain context
    if (
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/api/") ||
        pathname.match(/\.(js|css|woff|woff2|ttf|eot|svg|ico|png|jpg|jpeg|gif|webp)$/)
    ) {
        return NextResponse.next();
    }

    printf("🚀 [REQUEST START]", {
        time: new Date().toISOString(),
        method: request.method,
        url: request.url,
        pathname,
        hostname,
    });

    // Check for subdomain using domain utilities
    const subdomainInfo = detectSubdomain(hostname);

    if (subdomainInfo) {
        printf("DEV:DEBUG ✅ SUBDOMAIN DETECTED:", subdomainInfo.subdomain, "TYPE:", subdomainInfo.type);

        // Create response with school context headers for all routes
        const response = NextResponse.next();
        response.headers.set("x-school-username", subdomainInfo.subdomain);
        
        // Try to set school ID if available (skip expensive DB lookup)
        if (subdomainInfo.id) {
            response.headers.set("x-school-id", subdomainInfo.id);
        }
        
        printf("DEV:DEBUG 📝 SET HEADER x-school-username:", subdomainInfo.subdomain);
        if (subdomainInfo.id) {
            printf("DEV:DEBUG 📝 SET HEADER x-school-id:", subdomainInfo.id);
        }

        // Only rewrite the main page request to subdomain portal
        if (request.nextUrl.pathname === "/") {
            const url = request.nextUrl.clone();
            url.pathname = "/subdomain";
            url.searchParams.set("username", subdomainInfo.subdomain);

            printf("🔄 REWRITING TO:", url.toString());
            const rewriteResponse = NextResponse.rewrite(url);
            rewriteResponse.headers.set("x-school-username", subdomainInfo.subdomain);
            return rewriteResponse;
        }

        console.log("REQUEST COMPLETED12:");
        return response;
    }

    console.log("REQUEST COMPLETED:");
    return NextResponse.next();
}

// Matcher excludes static files, fonts, and images to reduce middleware invocations
// Next.js 16 optimization: Early returns in function are more efficient than complex matchers
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|apple-touch-icon.png|robots.txt|sitemap.xml).*)",
    ],
};

export default proxy;