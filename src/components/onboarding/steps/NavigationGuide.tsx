"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { FACEBOOK_NAV_ROUTES } from "@/config/facebook-nav-routes";
import { sendOnboardingEmail } from "@/supabase/server/onboarding";
import { Plus, Send, Users } from "lucide-react";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { WindToggle } from "@/src/components/themes/WindToggle";
import { useRouter } from "next/navigation";


const ROUTE_DESCRIPTIONS: Record<string, string> = {
    info: "Transactions Of Events.",
    classboard: "Lesson Management.",
    data: "Excel Done Right.",
    users: "Register Bookings.",
    help: "Always come back if you need to.",
};

const ROUTE_LABELS: Record<string, string> = {
    users: "Check in",
};

const NAV_IDS = ["info", "classboard", "data", "users", "help"] as const;

export default function NavigationGuide() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    // Filter and reorder routes to match NavLeft order
    const displayRoutes = NAV_IDS.map((id) => FACEBOOK_NAV_ROUTES.find((r) => r.id === id)).filter(Boolean);
    
    // Routes that have been explained (should be highlighted)
    const explainedRoutes = ["info", "classboard", "data"];

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email || !email.includes("@")) {
            return;
        }

        setIsSending(true);
        const result = await sendOnboardingEmail(email);
        setIsSending(false);

        if (result.success) {
            setEmailSent(true);
            setEmail("");
            toast.success("Thank You For Sharing");
            setTimeout(() => setEmailSent(false), 3000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-5xl flex flex-col h-full"
        >
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground tracking-tight border-b border-border pb-4 mb-4">Let's Get Started</h2>
                <h3 className="text-xl font-semibold text-foreground mb-4">Administration Navigation</h3>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                    We have talked about 3 of the 4 routes available, enough to get you started. Click on any of the links below, and enter the <a href="https://dummy_wind.adrenalink.tech/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">dummy wind school</a> for more information.
                </p>
            </div>

            {/* FacebookNav Replica */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-12"
            >
                <header className="w-full bg-card border-t border-facebook/30 border-b border-facebook shadow-sm shadow-[0_-4px_6px_-1px_rgb(var(--secondary)/0.1)] rounded-lg overflow-hidden">
                    <div className="container flex h-14 md:h-16 items-center justify-between px-3 sm:px-6 lg:px-8 mx-auto">
                        {/* NavLeft */}
                        <div className="flex items-center gap-1">
                            <a
                                href="https://dummy_wind.adrenalink.tech/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center cursor-pointer"
                            >
                                <Image
                                    src="/prototypes/north-icon.png"
                                    alt="School Logo"
                                    width={56}
                                    height={56}
                                    className="rounded-full object-cover w-14 h-14"
                                    priority
                                />
                            </a>
                            {displayRoutes.map((route) => {
                                if (!route) return null;
                                const Icon = route.icon;
                                const isExplained = explainedRoutes.includes(route.id);
                                const href = route.id === "data" ? "/students" : route.href;
                                
                                return (
                                    <a
                                        key={route.id}
                                        href={`https://dummy_wind.adrenalink.tech${href}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                                            isExplained ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </a>
                                );
                            })}
                        </div>

                        {/* NavCenter */}
                        <div className="hidden lg:flex flex-col items-center justify-center text-center">
                            <h1 className="text-2xl font-semibold text-foreground">Adrenalink</h1>
                        </div>

                        {/* NavRight */}
                        <div className="flex items-center gap-2">
                            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent">
                                <HeadsetIcon className="h-5 w-5" />
                            </button>
                            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent">
                                <Plus className="h-5 w-5" />
                            </button>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted overflow-hidden">
                                <WindToggle compact />
                            </div>
                            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent">
                                <AdminIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </header>
            </motion.div>

            {/* Route List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4 mb-8"
            >
                {displayRoutes.map((route, index) => {
                    if (!route) return null;
                    const Icon = route.icon;
                    const description = ROUTE_DESCRIPTIONS[route.id] || "";
                    const href = route.id === "data" ? "/students" : route.href;
                    const isExplained = explainedRoutes.includes(route.id);
                    const displayDescription = route.id === "users" 
                        ? "Go Register Your First Booking" 
                        : route.id === "help"
                        ? "Always come back here if you need"
                        : description;

                    return (
                        <motion.a
                            key={route.id}
                            href={`https://dummy_wind.adrenalink.tech${href}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className={`relative flex items-center gap-4 p-4 rounded-lg transition-colors cursor-pointer ${
                                isExplained ? "bg-primary/10 hover:bg-primary/20" : "hover:bg-muted/30"
                            }`}
                        >
                            {isExplained && (
                                <div className="absolute top-0 right-0 z-20">
                                    <div className="bg-card border-border/50 px-2 py-1 rounded-bl-lg border-b border-l flex items-center shadow-sm">
                                        <span className="text-xs font-medium text-primary">
                                            Explained
                                        </span>
                                    </div>
                                </div>
                            )}
                            <Icon className={`h-6 w-6 flex-shrink-0 ${isExplained ? "text-primary" : "text-primary"}`} />
                            <div className="flex-1">
                                <h3 className="font-display text-sm font-bold text-foreground">{ROUTE_LABELS[route.id] || route.label}</h3>
                                <p className="text-xs text-muted-foreground">{displayDescription}</p>
                            </div>
                        </motion.a>
                    );
                })}
            </motion.div>

            {/* Divider */}
            <div className="w-full h-px bg-border my-16" />

            {/* Sign Up Call to Action */}
            <div className="w-full max-w-[1600px] bg-white border border-zinc-200 rounded-[2.5rem] shadow-2xl overflow-hidden">
                {/* Banner Section */}
                <div className="relative w-full h-64 md:h-96 shrink-0 bg-zinc-100 flex items-center justify-center overflow-hidden border-b border-zinc-200">
                    <div className="opacity-20 grayscale">
                        <Image src="/ADR.webp" alt="Adrenalink" width={120} height={120} priority />
                    </div>
                </div>
                
                {/* Content Section */}
                <div className="px-6 md:px-10 py-8 md:py-12 bg-white/50 backdrop-blur-3xl">
                    <div className="text-center">
                        <Link 
                            href="/welcome"
                            className="inline-block text-5xl md:text-7xl font-black text-zinc-900 tracking-tight hover:text-zinc-700 transition-colors cursor-pointer"
                        >
                            SIGN UP
                        </Link>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-border my-16" />

            {/* Share Section */}
            <div className="w-full">
                <div className="max-w-md mx-auto">
                    <form onSubmit={handleEmailSubmit} className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">Share.</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="invitation-email@example.com"
                            className="flex-1 px-3 py-2 text-sm border-b border-border bg-transparent focus:outline-none focus:border-primary placeholder:text-muted-foreground"
                            disabled={isSending}
                        />
                        <button
                            type="submit"
                            disabled={isSending || !email || !email.includes("@")}
                            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-all ${
                                email && email.includes("@") && !isSending
                                    ? "text-primary hover:text-primary/80"
                                    : "text-muted-foreground cursor-not-allowed"
                            } disabled:opacity-50`}
                        >
                            <Send className="h-4 w-4" />
                            {isSending ? "Sending..." : emailSent ? "Sent!" : "SEND"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Mission */}
            <div className="mt-16 text-center">
                <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">Mission.</span> To Facilitate Lesson Planning
                </p>
            </div>

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
