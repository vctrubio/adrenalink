"use client";

import { useUser } from "@clerk/nextjs";
import { ROLE_CONFIG, type RoleType } from "@/src/components/auth/role-config";

import { detectSubdomain } from "@/types/domain";

// --- Helper ---

function getCurrentRole(user: any, isLoaded: boolean): RoleType {
    if (!isLoaded || !user) return "guest";

    // Detect school from hostname (standard in our multi-tenant architecture)
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const subdomainInfo = detectSubdomain(hostname);
    
    // We need the schoolId to find the context in metadata.
    // For the demo page, if no subdomain is detected, we can't show a specific role context.
    // In a real environment, the schoolId comes from the DB or is passed down.
    
    // Let's try to find a context that matches the subdomain username if we don't have the UUID readily available
    const schools = (user.publicMetadata?.schools as Record<string, any>) || {};
    
    // Attempt 1: Find by matching subdomain username (if we added it to metadata)
    // Attempt 2: Just find the "first" school if we are in demo mode without subdomain
    const schoolIds = Object.keys(schools);
    const context = subdomainInfo 
        ? Object.values(schools).find(s => s.schoolUsername === subdomainInfo.subdomain) || (schoolIds.length > 0 ? schools[schoolIds[0]] : null)
        : (schoolIds.length > 0 ? schools[schoolIds[0]] : null);

    if (!context) return "authenticated_no_role";

    const roleMeta = context.role;
    const isActive = context.isActive !== false;
    const isRental = context.isRental === true;

    if (roleMeta === "admin" || roleMeta === "school_admin") return "school_admin";
    if (roleMeta === "owner") return "owner";

    if (roleMeta === "teacher") {
        return isActive ? "teacher_active" : "teacher_inactive";
    }

    if (roleMeta === "student") {
        return isRental ? "student_rental" : "student_standard";
    }

    return "guest";
}

// --- Component ---

export function SchoolRoleContext() {
    const { user, isLoaded } = useUser();
    const currentRole = getCurrentRole(user, isLoaded);

    const layoutGroups = [
        {
            title: "School Management",
            roles: ["owner", "school_admin"] as RoleType[],
        },
        {
            title: "Teacher Roles",
            roles: ["teacher_active", "teacher_inactive", "teacher_unlinked"] as RoleType[],
        },
        {
            title: "Student Roles",
            roles: ["student_standard", "student_rental", "student_unlinked"] as RoleType[],
        },
        {
            title: "System Status",
            roles: ["authenticated_no_role", "guest"] as RoleType[],
        },
    ];

    return (
        <div className="space-y-8 mt-8">
            {layoutGroups.map((group) => (
                <div key={group.title} className="p-8 border border-border rounded-3xl bg-card shadow-sm">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-8 flex items-center gap-3">
                        <span className="w-1 h-4 bg-secondary rounded-full" />
                        {group.title}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {group.roles.map((roleKey) => {
                            const config = ROLE_CONFIG[roleKey];
                            const isActive = currentRole === roleKey;
                            const Icon = config.icon;

                            // Visual State
                            const opacityClass = isActive ? "opacity-100" : "opacity-40 hover:opacity-80";

                            return (
                                <div
                                    key={roleKey}
                                    className={`
                                        relative p-6 rounded-3xl border transition-all duration-300 flex flex-col gap-4
                                        ${
                                            isActive
                                                ? `${config.bgClass} border-primary/20 shadow-sm scale-[1.02]`
                                                : `bg-transparent border-transparent hover:bg-muted/10 ${opacityClass}`
                                        }
                                    `}
                                >
                                    {isActive && (
                                        <div className="absolute top-4 right-4">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`p-3 rounded-2xl bg-background border border-border/50 shadow-sm ${isActive ? "ring-2 ring-primary/10" : ""}`}
                                        >
                                            <Icon className={config.colorClass} size={28} />
                                        </div>
                                        <div>
                                            <h3
                                                className={`text-lg font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                                            >
                                                {config.label}
                                            </h3>
                                        </div>
                                    </div>

                                    <ul className="space-y-2 pl-1">
                                        {config.descriptionPoints.map((point, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-2 text-sm text-muted-foreground/80 leading-relaxed"
                                            >
                                                <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
