import { NextRequest, NextResponse } from "next/server";
import printf from "../printf.js";
import { detectSubdomain } from "../types/domain";

export function middleware(request: NextRequest) {
    const hostname = request.headers.get("host") || "";

    printf("MIDDLEWARE:2", request.url);
    printf("Host:", hostname);

    // Check for subdomain using domain utilities
    const subdomainInfo = detectSubdomain(hostname);
    
    if (subdomainInfo) {
        printf("SUBDOMAIN DETECTED:", subdomainInfo.subdomain, "TYPE:", subdomainInfo.type);

        // Create response with school context header for all routes
        const response = NextResponse.next();
        response.headers.set("x-school-username", subdomainInfo.subdomain);

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

        printf("🏫 SCHOOL CONTEXT SET:", subdomainInfo.subdomain);
        return response;
    }

    return NextResponse.next();
}

// Only run middleware on page routes, not static assets
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
