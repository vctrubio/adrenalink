"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, List, DollarSign, Wrench } from "lucide-react";

interface TeacherNavigationProps {
    teacherId: string;
}

const TEACHER_ROUTES = [
    { id: "events", label: "Schedule", icon: Calendar, path: "events" },
    { id: "lessons", label: "Lessons", icon: List, path: "lessons" },
    { id: "commissions", label: "Commissions", icon: DollarSign, path: "commissions" },
    { id: "equipments", label: "Equipment", icon: Wrench, path: "equipments" },
] as const;

export function TeacherNavigation({ teacherId }: TeacherNavigationProps) {
    const pathname = usePathname();

    // Determine active route
    const getActiveRoute = () => {
        for (const route of TEACHER_ROUTES) {
            if (pathname.includes(`/teacher/${teacherId}/${route.path}`)) {
                return route.id;
            }
        }
        // Default to events if on base teacher page
        return "events";
    };

    const activeRoute = getActiveRoute();

    return (
        <div className="relative flex items-center p-1 rounded-xl bg-muted/20 border border-white/10 backdrop-blur-sm shadow-sm overflow-hidden">
            {TEACHER_ROUTES.map((route) => {
                const isActive = activeRoute === route.id;
                const Icon = route.icon;
                const href = `/teacher/${teacherId}/${route.path}`;

                return (
                    <Link
                        key={route.id}
                        href={href}
                        className={`relative z-10 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                            isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                        }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="teacher-nav-active-bg"
                                className="absolute inset-0 rounded-lg bg-background shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-border/50"
                                initial={false}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <Icon size={16} className={isActive ? "text-primary" : "text-muted-foreground"} />
                            <span>{route.label}</span>
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
