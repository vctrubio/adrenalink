"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FACEBOOK_NAV_ROUTES } from "@/config/facebook-nav-routes";


const ROUTE_DESCRIPTIONS: Record<string, string> = {
    info: "Your financial dashboard",
    classboard: "Daily lesson command center",
    data: "One source of truth",
    users: "Register Bookings",
    help: "Get help and guidance",
};

const ROUTE_LABELS: Record<string, string> = {
    users: "Check in",
};

const NAV_IDS = ["info", "classboard", "data", "users", "help"] as const;

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
            className="w-full max-w-5xl flex flex-col h-full"
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
                className="mt-16 text-center space-y-2"
            >
                <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">Mission.</span> To Facilitate Lesson Planning
                </p>
                <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">Try.</span>{" "}
                    <Link href="/register" className="text-primary hover:underline">
                        Adding your first register.
                    </Link>
                </p>
                <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">Questions?</span>{" "}
                    <a 
                        href="https://wa.me/+34686516248" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                    >
                        Contact me
                    </a>
                    .
                </p>
            </motion.div>

            {/* Part 2 - Coming Up Next */}
            {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-24 text-center space-y-1"
            >
                <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-2">Coming Up Next</p>
                <p className="text-xs text-muted-foreground">Classboard Introduction</p>
                <p className="text-xs text-muted-foreground">Teacher Status Controller</p>
                <p className="text-xs text-muted-foreground">Student Reservations</p>
            </motion.div> */}

        </motion.div>
    );
}

function Part2Carousel() {
    const carouselItems = [
        "Teacher Management",
        "Classboard Introduction",
        "Students Reservations",
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="w-full"
        >
            <div className="text-center mb-6">
                <h2 className="text-2xl font-black tracking-tight text-foreground">Part 2</h2>
            </div>

            <div className="relative max-w-2xl mx-auto overflow-hidden">
                <div 
                    className="flex"
                    style={{
                        animation: "scroll 15s linear infinite",
                        width: "fit-content",
                    }}
                >
                    {[...carouselItems, ...carouselItems].map((item, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 px-8 text-center"
                        >
                            <h3 className="text-xl md:text-2xl font-black text-foreground whitespace-nowrap">
                                {item}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
            `}</style>
        </motion.div>
    );
}
