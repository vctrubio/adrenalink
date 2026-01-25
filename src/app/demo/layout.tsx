import Link from "next/link";
import { ReactNode } from "react";
import { ClerkUserDropdown } from "@/src/components/auth/ClerkUserDropdown";
import { getUserSchoolContext } from "@/src/providers/user-school-provider";

export default async function DemoLayout({ children }: { children: ReactNode }) {
    // Verify server-side context resolution
    const context = await getUserSchoolContext();
    const serverRole = context.clerkUserMetadata?.role;

    return (
        <div className="min-h-screen bg-background">
            {/* Demo Navigation */}
            <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link
                            href="/demo"
                            className="text-sm font-black uppercase tracking-widest text-foreground hover:text-primary transition-colors"
                        >
                            Demo
                        </Link>
                        <div className="h-4 w-px bg-border" />
                        <div className="flex items-center gap-6">
                            <Link
                                href="/demo"
                                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/demo/portals"
                                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Portals
                            </Link>
                            <Link
                                href="/demo/users"
                                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Users
                            </Link>
                        </div>
                    </div>

                    {/* Auth Status - Powered by Server Context */}
                    <ClerkUserDropdown serverRole={serverRole} />
                </div>
            </nav>

            <main>{children}</main>
        </div>
    );
}
