"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FACEBOOK_NAV_ROUTES } from "@/config/facebook-nav-routes";

const ROUTE_DESCRIPTIONS: Record<string, string> = {
    info: "Your financial dashboard",
    classboard: "Daily lesson command center",
    data: "One source of truth",
    users: "Register Bookings",
    invitations: "See who wants in",
};

const ROUTE_LABELS: Record<string, string> = {
    users: "Check in",
};

const NAV_IDS = ["info", "classboard", "data", "users", "invitations"] as const;

export default function NavigationGuide() {
    const router = useRouter();
    // Filter and reorder routes to match NavLeft order
    const displayRoutes = NAV_IDS.map((id) => FACEBOOK_NAV_ROUTES.find((r) => r.id === id)).filter(Boolean);
    
    // Routes that have been explained (should be highlighted)
    const explainedRoutes = ["info", "classboard", "data"];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-5xl"
        >
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Let's Get Started</h2>
            </div>

            {/* Route Labels and Descriptions */}
            <div className="flex items-center justify-center gap-8 flex-wrap">
                {displayRoutes.map((route, index) => {
                    if (!route) return null;
                    const Icon = route.icon;
                    const description = ROUTE_DESCRIPTIONS[route.id] || "";

                    const isExplained = explainedRoutes.includes(route.id);

                    return (
                        <motion.div
                            key={route.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => router.push("/")}
                            className={`flex flex-col items-center gap-2 max-w-[200px] p-4 rounded-xl cursor-pointer transition-all ${
                                isExplained ? "bg-muted hover:bg-muted/80" : "hover:bg-muted/30"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Icon className="h-5 w-5 text-primary" />
                                <h3 className="font-display text-sm font-bold text-foreground">{ROUTE_LABELS[route.id] || route.label}</h3>
                            </div>
                            <p className="text-xs text-muted-foreground text-center leading-relaxed">{description}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-16 text-center"
            >
                <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">Mission.</span> To Facilitate Lesson Planning
                </p>
            </motion.div>
        </motion.div>
    );
}
