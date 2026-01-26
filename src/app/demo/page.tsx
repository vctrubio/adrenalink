"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { UserDebugContext } from "./UserDebugContext";
import { SchoolRoleContext } from "./SchoolRoleContext";

export default function DemoPage() {
    const { user } = useUser();

    return (
        <div className="min-h-screen bg-background relative p-8">
            <div className="max-w-6xl mx-auto mt-8">
                <div className="grid gap-6">
                    {/* Modular Context Components */}
                    <UserDebugContext />
                    
                    <SchoolRoleContext />

                    <div className="flex justify-between items-center px-6 mt-4">
                        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                            ← BACK
                        </Link>
                        <div className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-tighter">
                            UID: {user?.id || "ANONYMOUS"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
