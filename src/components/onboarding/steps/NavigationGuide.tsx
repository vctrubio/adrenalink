"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import { FACEBOOK_NAV_ROUTES } from "@/config/facebook-nav-routes";
import { Image as ImageIcon, MapPin, Tag, CheckCircle2 } from "lucide-react";
import { sendOnboardingEmail } from "@/supabase/server/onboarding";


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
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground tracking-tight border-b border-border pb-4">Let's Get Started</h2>
            </div>

            {/* Navigation Panel Header */}
            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">Navigation Panel</h3>
                <p className="text-sm text-muted-foreground">
                    We have seen <span className="text-primary">3</span> of the <span className="text-muted-foreground">4</span> possible routes.
                </p>
            </div>

            {/* Route Labels and Descriptions */}
            <div className="flex items-center justify-center gap-8 flex-wrap">
                {displayRoutes.map((route, index) => {
                    if (!route) return null;
                    const Icon = route.icon;
                    const description = ROUTE_DESCRIPTIONS[route.id] || "";

                    const isExplained = explainedRoutes.includes(route.id);
                    const isHelp = route.id === "help";

                    return (
                        <div key={route.id} className="flex items-center gap-8">
                            {isHelp && <div className="h-12 w-px bg-border" />}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => {
                                    const href = route.id === "data" ? "/students" : route.href;
                                    window.location.href = `https://dummy_wind.adrenalink.tech${href}`;
                                }}
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
                        </div>
                    );
                })}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-border my-16" />

            {/* Register Your First School */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-16 text-center space-y-6"
            >
                <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Register Your First School</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        <Link href="/register" className="text-primary hover:underline">
                            Welcome Form
                        </Link>{" "}
                        for schools looking to get started
                    </p>
                </div>

                {/* Form Steps */}
                <div className="flex items-center justify-center gap-8 flex-wrap">
                    {/* Assets Step */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        onClick={() => window.location.href = "https://adrenalink.tech/welcome"}
                        className="flex flex-col items-center gap-2 max-w-[200px] p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-primary" />
                            <h3 className="font-display text-sm font-bold text-foreground">Assets</h3>
                        </div>
                        <p className="text-xs text-muted-foreground text-center leading-relaxed">
                            Customise your schools landing page for students to visit
                        </p>
                    </motion.div>

                    {/* Details Step */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        onClick={() => window.location.href = "https://adrenalink.tech/welcome"}
                        className="flex flex-col items-center gap-2 max-w-[200px] p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <h3 className="font-display text-sm font-bold text-foreground">Details</h3>
                        </div>
                        <p className="text-xs text-muted-foreground text-center leading-relaxed">
                            Give us your full contact information
                        </p>
                    </motion.div>

                    {/* Categories Step */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        onClick={() => window.location.href = "https://adrenalink.tech/welcome"}
                        className="flex flex-col items-center gap-2 max-w-[200px] p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <Tag className="h-5 w-5 text-primary" />
                            <h3 className="font-display text-sm font-bold text-foreground">Categories</h3>
                        </div>
                        <p className="text-xs text-muted-foreground text-center leading-relaxed">
    Select your Adrenaline Activities Kite, Wing, Windsurf
                        </p>
                    </motion.div>

                    {/* Summary Step */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        onClick={() => window.location.href = "https://adrenalink.tech/welcome"}
                        className="flex flex-col items-center gap-2 max-w-[200px] p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <h3 className="font-display text-sm font-bold text-foreground">Summary</h3>
                        </div>
                        <p className="text-xs text-muted-foreground text-center leading-relaxed">
                            Get your confirmation email and start your journey.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Divider */}
            <div className="w-full h-px bg-border my-16" />

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
                <div className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">Share.</span>{" "}
                    <form onSubmit={handleEmailSubmit} className="inline-flex items-center justify-center gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="invitation-email"
                            className="text-sm text-center text-primary border-b border-primary bg-transparent focus:outline-none focus:border-primary/80 placeholder:text-primary/60 placeholder:text-muted-foreground min-w-[140px]"
                            disabled={isSending}
                        />
                        <button
                            type="submit"
                            disabled={isSending || !email || !email.includes("@")}
                            className={`text-sm font-bold transition-all rounded px-2 py-1 ${
                                email && email.includes("@") && !isSending
                                    ? "text-primary hover:bg-muted"
                                    : "text-muted-foreground hover:bg-muted"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isSending ? "Sending..." : emailSent ? "Sent!" : "SEND"}
                        </button>
                    </form>
                </div>
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
