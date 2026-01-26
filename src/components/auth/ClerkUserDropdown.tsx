"use client";

import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import AdminIcon from "@/public/appSvgs/AdminIcon.jsx";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import HelmetIcon from "@/public/appSvgs/HelmetIcon.jsx";

interface ClerkUserDropdownProps {
    serverRole?: string;
}

function RoleBasedIcon({ serverRole }: { serverRole?: string }) {
    const { user } = useUser();
    // In our multi-tenant architecture, the role MUST be resolved by the server 
    // context or middleware and passed down. Flat metadata is no longer used.
    const role = serverRole;

    if (role === "school_admin" || role === "admin" || role === "owner") {
        return <AdminIcon className="text-foreground" size={22} />;
    }
    
    if (role === "teacher") {
        // Since we can't easily get isActive from the flat role string, 
        // we assume active if we got this far, or we could pass isActive as a prop.
        return <HeadsetIcon className="text-foreground" size={22} />;
    }
    
    if (role === "student") {
        // We could also pass isRental as a prop if needed for the icon state
        return <HelmetIcon className="text-yellow-500" size={22} />;
    }

    // Default icon for authenticated users without a specific school context
    return <HelmetIcon className="text-secondary" size={22} />;
}

export function ClerkUserDropdown({ serverRole }: ClerkUserDropdownProps) {
    return (
        <div className="flex items-center gap-4">
            <SignedOut>
                <SignInButton mode="modal">
                    <button className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-all active:scale-95 border border-border/50">
                        <HelmetIcon className="text-muted-foreground/60" size={20} />
                    </button>
                </SignInButton>
            </SignedOut>
            <SignedIn>
                <div className="relative w-10 h-10">
                    {/* Custom Icon (Background Layer) */}
                    <div className="absolute inset-0 w-full h-full rounded-full bg-muted/30 flex items-center justify-center border border-border shadow-sm pointer-events-none">
                        <RoleBasedIcon serverRole={serverRole} />
                    </div>
                    
                    {/* Invisible Clerk Button (Interaction Layer) */}
                    <div className="absolute inset-0 w-full h-full opacity-0 hover:opacity-0 z-10 cursor-pointer">
                        <UserButton 
                            appearance={{
                                elements: {
                                    rootBox: "w-full h-full",
                                    avatarBox: "w-full h-full",
                                    userButtonTrigger: "w-full h-full focus:shadow-none"
                                }
                            }}
                            afterSignOutUrl={typeof window !== "undefined" ? window.location.href : "/"} 
                        />
                    </div>
                </div>
            </SignedIn>
        </div>
    );
}
