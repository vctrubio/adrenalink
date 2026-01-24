"use client";

import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import HelmetIcon from "@/public/appSvgs/HelmetIcon.jsx";
import AdminIcon from "@/public/appSvgs/AdminIcon.jsx";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import { UserDebugContext } from "./UserDebugContext";
import { SchoolRoleContext } from "./SchoolRoleContext";

function RoleBasedIcon() {
    const { user } = useUser();
    const role = user?.publicMetadata?.role as string;

    if (role === "school_admin" || role === "admin") {
        return <AdminIcon className="text-foreground" size={22} />;
    }
    
    if (role === "teacher") {
        return <HeadsetIcon className="text-foreground" size={22} />;
    }
    
    if (role === "student") {
        return <HelmetIcon className="text-yellow-500" size={22} />;
    }

    // Signed in but no role assigned - Helmet Secondary
    return <HelmetIcon className="text-secondary" size={22} />;
}

export default function DemoPage() {
    const { user } = useUser();

    return (
        <div className="min-h-screen bg-background relative p-8">
            {/* Top Right - Minimal Role Avatar with Clerk Dropdown */}
            <div className="absolute top-8 right-8 flex items-center gap-4">
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
                            <RoleBasedIcon />
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
                                afterSignOutUrl="/demo" 
                            />
                        </div>
                    </div>
                </SignedIn>
            </div>

            <div className="max-w-6xl mx-auto mt-20">
                <div className="grid gap-6">
                    {/* Modular Context Components */}
                    <UserDebugContext />
                    
                    <SchoolRoleContext />

                    <div className="flex justify-between items-center px-6 mt-4">
                        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                            ← BACK
                        </Link>
                        <div className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-tighter">
                            UID: {user?.id || 'ANONYMOUS'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
