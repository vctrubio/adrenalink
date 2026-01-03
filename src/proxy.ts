import { NextRequest, NextResponse } from "next/server";
import printf from "../printf.js";
import { detectSubdomain } from "../types/domain";

export function proxy(request: NextRequest) {
    const hostname = request.headers.get("host") || "";
    const pathname = request.nextUrl.pathname;

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

        // Create response with school context header for all routes
        const response = NextResponse.next();
        response.headers.set("x-school-username", subdomainInfo.subdomain);
        printf("DEV:DEBUG 📝 SET HEADER x-school-username:", subdomainInfo.subdomain);

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

        // printf("🏫 SCHOOL CONTEXT SET:", subdomainInfo.subdomain);
        console.log("REQUEST COMPLETED12:");
        return response;
    }

    console.log("REQUEST COMPLETED:");
    return NextResponse.next();
}

// Only run proxy on page routes, not static assets
export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export default proxy;
