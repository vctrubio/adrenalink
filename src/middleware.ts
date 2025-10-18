import { NextRequest, NextResponse } from "next/server";
import printf from "../printf.js";

export function middleware(request: NextRequest) {
    const hostname = request.headers.get("host") || "";

    printf("MIDDLEWARE:2", request.url);
    printf("Host:", hostname);

    // Check for subdomain: if it contains .lvh.me:3000 but doesn't start with lvh.me
    if (hostname.includes(".lvh.me:3000") && !hostname.startsWith("lvh.me")) {
        const subdomain = hostname.split(".")[0];
        printf("SUBDOMAIN DETECTED:", subdomain);

        // Only rewrite the main page request, not static assets
        if (request.nextUrl.pathname === "/") {
            const url = request.nextUrl.clone();
            url.pathname = "/subdomain";
            url.searchParams.set("username", subdomain);

            printf("🔄 REWRITING TO:", url.toString());
            return NextResponse.rewrite(url);
        }
    }

    return NextResponse.next();
}

// Only run middleware on page routes, not static assets
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
