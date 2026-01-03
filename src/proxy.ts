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
        console.log(`🔍 [DEBUG_PROXY] Subdomain "${subdomainInfo.subdomain}" detected for ${hostname}`);

        // Create response with school context header for all routes
        const response = NextResponse.next();
        response.headers.set("x-school-username", subdomainInfo.subdomain);
        console.log(`🔍 [DEBUG_PROXY] Header 'x-school-username' set to: ${subdomainInfo.subdomain}`);

        // Only rewrite the main page request to subdomain portal
        if (request.nextUrl.pathname === "/") {
            const url = request.nextUrl.clone();
            url.pathname = "/subdomain";
            url.searchParams.set("username", subdomainInfo.subdomain);

            console.log(`🔍 [DEBUG_PROXY] Rewriting "/" to "/subdomain?username=${subdomainInfo.subdomain}"`);
            const rewriteResponse = NextResponse.rewrite(url);
            rewriteResponse.headers.set("x-school-username", subdomainInfo.subdomain);
            return rewriteResponse;
        }

        return response;
    }

    console.log(`🔍 [DEBUG_PROXY] No school subdomain detected for: ${hostname}`);
    return NextResponse.next();
}

// Only run proxy on page routes, not static assets
export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export default proxy;
