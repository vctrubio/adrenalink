import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const hostname = request.headers.get("host") || "";
    
    console.log("🔥 MIDDLEWARE:", request.url);
    console.log("📍 Host:", hostname);
    
    // Check for subdomain: if it contains .lvh.me:3000 but doesn't start with lvh.me
    if (hostname.includes(".lvh.me:3000") && !hostname.startsWith("lvh.me")) {
        const subdomain = hostname.split(".")[0];
        console.log("🎯 SUBDOMAIN DETECTED:", subdomain);
        
        // Only rewrite the main page request, not static assets
        if (request.nextUrl.pathname === "/") {
            const url = request.nextUrl.clone();
            url.pathname = "/subdomain";
            url.searchParams.set("username", subdomain);
            
            console.log("🔄 REWRITING TO:", url.toString());
            return NextResponse.rewrite(url);
        }
    }
    
    return NextResponse.next();
}

// Remove matcher entirely to run on ALL requests
// export const config = {
//     matcher: [
//         "/((?!_next/static|_next/image|favicon.ico).*)",
//     ],
// }