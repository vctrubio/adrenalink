import { NextRequest, NextResponse } from "next/server";
import printf from "../printf.js";
import { detectSubdomain } from "../types/domain";
import { getServerConnection } from "@/supabase/connection";

export async function proxy(request: NextRequest) {
    const hostname = request.headers.get("host") || "";
    const pathname = request.nextUrl.pathname;

    // Early return for common assets and internal routes
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
        printf("DEV:DEBUG ✅ SUBDOMAIN DETECTED:", subdomainInfo.subdomain);

        // Validate school exists (username is indexed via UNIQUE constraint)
        try {
            const supabase = getServerConnection();
            const { data } = await supabase
                .from("school")
                .select("id")
                .eq("username", subdomainInfo.subdomain)
                .single();
            
            if (!data?.id) {
                printf("DEV:DEBUG ❌ SCHOOL NOT FOUND FOR:", subdomainInfo.subdomain);
                return NextResponse.redirect(new URL("/schools", request.url));
            }
        } catch (error) {
            printf("DEV:DEBUG ❌ SCHOOL LOOKUP ERROR:", error);
            return NextResponse.redirect(new URL("/schools", request.url));
        }

        // Create response with school username header
        const response = NextResponse.next();
        response.headers.set("x-school-username", subdomainInfo.subdomain);
        
        printf("DEV:DEBUG 📝 SET HEADER x-school-username:", subdomainInfo.subdomain);

        // Only rewrite the main page request to subdomain portal
        if (request.nextUrl.pathname === "/") {
            const url = request.nextUrl.clone();
            url.pathname = "/subdomain";

            printf("🔄 REWRITING TO:", url.toString());
            const rewriteResponse = NextResponse.rewrite(url);
            rewriteResponse.headers.set("x-school-username", subdomainInfo.subdomain);
            return rewriteResponse;
        }

        return response;
    }

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