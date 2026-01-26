import { clerkClient } from "@clerk/nextjs/server";
import Image from "next/image";

export default async function DemoUsersPage() {
    const client = await clerkClient();
    const { data: users } = await client.users.getUserList({
        limit: 20,
        orderBy: "-created_at"
    });

    return (
        <div className="max-w-6xl mx-auto px-8 py-12">
            <div className="mb-12">
                <h1 className="text-2xl font-bold text-foreground mb-2">User Registry</h1>
                <p className="text-muted-foreground">View all registered users and their synchronized multi-tenant metadata.</p>
            </div>

            <div className="grid gap-6">
                {users.map((user) => {
                    const metadata = user.publicMetadata as any;
                    const schools = (metadata.schools as Record<string, any>) || {};
                    const schoolCount = Object.keys(schools).length;
                    
                    return (
                        <div key={user.id} className="p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col md:flex-row gap-6">
                            {/* User Identity */}
                            <div className="flex items-start gap-4 min-w-[300px]">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted border border-border">
                                    <Image 
                                        src={user.imageUrl} 
                                        alt={user.firstName || "User"} 
                                        fill 
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">
                                        {user.firstName} {user.lastName}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-1">{user.emailAddresses[0]?.emailAddress}</p>
                                    <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                        {user.id}
                                    </code>
                                </div>
                            </div>

                            {/* Role & Metadata */}
                            <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {schoolCount === 0 ? (
                                        <span className="text-xs text-muted-foreground italic">No school contexts assigned</span>
                                    ) : (
                                        Object.entries(schools).map(([id, context]: [string, any]) => (
                                            <div key={id} className="flex items-center gap-2 bg-muted/30 border border-border/50 px-2 py-1 rounded-md">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                    context.role === "owner" ? "text-purple-600" :
                                                    context.role === "teacher" ? "text-green-600" :
                                                    "text-yellow-600"
                                                }`}>
                                                    {context.role}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    @{context.schoolId.slice(0, 6)}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="relative group">
                                    <pre className="p-4 bg-muted/30 text-muted-foreground rounded-lg text-[10px] font-mono overflow-auto border border-border/50 max-h-[100px] group-hover:max-h-[500px] transition-all duration-300">
                                        {JSON.stringify(user.publicMetadata, null, 2)}
                                    </pre>
                                    <span className="absolute top-2 right-2 text-[9px] uppercase tracking-widest text-muted-foreground/50 pointer-events-none">
                                        Public Metadata
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
