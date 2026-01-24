"use client";

import { useUser } from "@clerk/nextjs";
import AdminIcon from "@/public/appSvgs/AdminIcon.jsx";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import HelmetIcon from "@/public/appSvgs/HelmetIcon.jsx";
import { JSX } from "react";

// --- Configuration ---

type RoleType = 
    | "owner" 
    | "school_admin" 
    | "teacher_active" 
    | "teacher_inactive"
    | "student_standard" 
    | "student_rental"
    | "authenticated_no_role" 
    | "guest";

interface RoleConfig {
    label: string;
    descriptionPoints: string[];
    icon: (props: { className?: string; size?: number }) => JSX.Element;
    colorClass: string;
    bgClass: string;
}

const ROLE_CONFIG: Record<RoleType, RoleConfig> = {
    // --- School Roles ---
    owner: {
        label: "Owner",
        descriptionPoints: [
            "Primary account holder linked to school ID.",
            "Ultimate control over billing & settings.",
            "Cannot be removed by other admins."
        ],
        icon: AdminIcon,
        colorClass: "text-purple-600 dark:text-purple-400",
        bgClass: "bg-purple-50 dark:bg-purple-900/10",
    },
    school_admin: {
        label: "Admin",
        descriptionPoints: [
            "Managed via `school_admins` relation.",
            "Broad access to operations.",
            "Can manage bookings, teachers, & students."
        ],
        icon: AdminIcon,
        colorClass: "text-blue-600 dark:text-blue-400",
        bgClass: "bg-blue-50 dark:bg-blue-900/10",
    },

    // --- Teacher Roles ---
    teacher_active: {
        label: "Teacher (Active)",
        descriptionPoints: [
            "Active instructor in `teacher` table.",
            "Can accept bookings & commissions.",
            "Visible on public schedules."
        ],
        icon: HeadsetIcon,
        colorClass: "text-green-600 dark:text-green-400",
        bgClass: "bg-green-50 dark:bg-green-900/10",
    },
    teacher_inactive: {
        label: "Teacher (Inactive)",
        descriptionPoints: [
            "`active` flag set to FALSE.",
            "Cannot accept new bookings.",
            "Retains history & commission data.",
            "Muted headset icon."
        ],
        icon: HeadsetIcon,
        colorClass: "text-muted-foreground",
        bgClass: "bg-muted/30",
    },

    // --- Student Roles ---
    student_standard: {
        label: "Student (Standard)",
        descriptionPoints: [
            "Linked via `school_students`.",
            "Standard learning progression.",
            "Owns their own equipment."
        ],
        icon: (props) => <HelmetIcon {...props} />,
        colorClass: "text-yellow-600 dark:text-yellow-400",
        bgClass: "bg-yellow-50 dark:bg-yellow-900/10",
    },
    student_rental: {
        label: "Student (Rental)",
        descriptionPoints: [
            "`rental` flag set to TRUE.",
            "Can rent school equipment.",
            "Red helmet indicates rental status.",
            "Managed in `school_students`."
        ],
        icon: (props) => <HelmetIcon {...props} rental />,
        colorClass: "text-destructive", // Red for rental
        bgClass: "bg-destructive/10",
    },

    // --- System Roles ---
    authenticated_no_role: {
        label: "Authenticated (Unassigned)",
        descriptionPoints: [
            "Signed in via Clerk.",
            "Not linked to any school yet.",
            "Pending assignment or onboarding."
        ],
        icon: (props) => <HelmetIcon {...props} />,
        colorClass: "text-secondary",
        bgClass: "bg-secondary/10",
    },
    guest: {
        label: "Guest",
        descriptionPoints: [
            "Unauthenticated user.",
            "Limited public access.",
            "Must sign in to interact."
        ],
        icon: (props) => <HelmetIcon {...props} />,
        colorClass: "text-muted-foreground",
        bgClass: "bg-muted/30",
    },
};

// --- Helper ---

function getCurrentRole(user: any, isLoaded: boolean): RoleType {
    if (!isLoaded || !user) return "guest";

    const roleMeta = user.publicMetadata?.role as string | undefined;
    const isActive = user.publicMetadata?.isActive !== false; // Default true
    const isRental = user.publicMetadata?.isRental === true; // Default false

    if (!roleMeta) return "authenticated_no_role";

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
            roles: ["teacher_active", "teacher_inactive"] as RoleType[],
        },
        {
            title: "Student Roles",
            roles: ["student_standard", "student_rental"] as RoleType[],
        },
        {
            title: "System Status",
            roles: ["authenticated_no_role", "guest"] as RoleType[],
        }
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
                            // We dim non-active items, but not too much so the legend is readable
                            const opacityClass = isActive ? "opacity-100" : "opacity-40 hover:opacity-80";

                            return (
                                <div 
                                    key={roleKey}
                                    className={`
                                        relative p-6 rounded-3xl border transition-all duration-300 flex flex-col gap-4
                                        ${isActive 
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
                                        <div className={`p-3 rounded-2xl bg-background border border-border/50 shadow-sm ${isActive ? "ring-2 ring-primary/10" : ""}`}>
                                            <Icon className={config.colorClass} size={28} />
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                                {config.label}
                                            </h3>
                                        </div>
                                    </div>

                                    <ul className="space-y-2 pl-1">
                                        {config.descriptionPoints.map((point, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground/80 leading-relaxed">
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
