"use client";

import { ReactNode } from "react";
import { UserButton, SignedIn } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";

export default function AuthLayout({ children }: { children: ReactNode }) {
    const { userId, isSignedIn } = useAuth();

    // Debug logging
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        console.log("🔐 Clerk Auth Debug:");
        console.log("  User ID:", userId);
        console.log("  Signed In:", isSignedIn);
        console.log("  Subdomain:", window.location.hostname);
        console.log("  Full URL:", window.location.href);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
            <div className="absolute top-4 right-4">
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>
            {children}
        </div>
    );
}
