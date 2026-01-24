"use client";

import { useUser } from "@clerk/nextjs";

export function UserDebugContext() {
    const { user, isLoaded } = useUser();

    if (!isLoaded) {
        return (
            <div className="p-8 border border-border rounded-3xl bg-card shadow-sm animate-pulse">
                <div className="h-4 bg-muted/20 rounded w-1/4 mb-8" />
                <div className="h-32 bg-muted/10 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="p-8 border border-border rounded-3xl bg-card shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-8 flex items-center gap-3">
                <span className="w-1 h-4 bg-primary rounded-full" />
                User Debug Context
            </h2>
            
            <div className="space-y-10">
                <section>
                    <h3 className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-4">Metadata</h3>
                    <pre className="p-6 bg-muted/20 text-foreground rounded-2xl text-[11px] font-mono overflow-auto border border-border/50">
                        {JSON.stringify(user?.publicMetadata || {}, null, 4)}
                    </pre>
                </section>

                <section>
                    <h3 className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-4">Core Identity</h3>
                    <pre className="p-6 bg-muted/20 text-foreground rounded-2xl text-[11px] font-mono overflow-auto border border-border/50 max-h-[300px]">
                        {JSON.stringify(
                            user ? {
                                id: user.id,
                                fullName: user.fullName,
                                email: user.primaryEmailAddress?.emailAddress,
                                username: user.username,
                                lastActive: user.lastSignInAt,
                            } : null, 
                            null, 4
                        )}
                    </pre>
                </section>
            </div>
        </div>
    );
}
