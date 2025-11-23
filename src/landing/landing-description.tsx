"use client";

import { useEffect, useState } from "react";
import { Camera, User, ArrowRight, TrendingUp } from "lucide-react";
import { BackgroundImage } from "@/src/components/BackgroundImage";
import FloatingNav from "@/src/components/navigations/FloatingNav";
import OpenBookIcon from "@/public/appSvgs/OpenBookIcon";
import MagnifyingGlassIcon from "@/public/appSvgs/MagnifyingGlassIcon";
import Link from "next/link";

// Feature data with call-to-action links
const FEATURES = [
    {
        icon: OpenBookIcon,
        title: "Documentation",
        description: "Complete guides and manuals",
        link: "/docs/manual",
    },
    {
        icon: MagnifyingGlassIcon,
        title: "What We Do",
        description: "Discover our mission and values",
        link: "/docs/wwd",
    },
    {
        icon: TrendingUp,
        title: "Onboarding & Pricing",
        description: "Get started and view our plans",
        link: "/docs/pricing",
    },
];

// Feature Card Component
function FeatureCard({ feature }: { feature: (typeof FEATURES)[0] }) {
    const accentColor = "#3b82f6";
    const IconComponent = feature.icon;

    return (
        <Link
            href={feature.link}
            className="rounded-3xl px-10 py-10 backdrop-blur-2xl border-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer group overflow-hidden"
            style={{
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                borderColor: accentColor,
                boxShadow: `0 20px 60px ${accentColor}30`,
            }}
            onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = `0 20px 60px ${accentColor}60`;
                el.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
            }}
            onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = `0 20px 60px ${accentColor}30`;
                el.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
            }}
        >
            {/* Background accent bar */}
            <div
                className="absolute top-0 left-0 h-1 w-full"
                style={{
                    background: `linear-gradient(90deg, ${accentColor}, transparent)`,
                }}
            />

            <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-6 flex-1">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                        <IconComponent className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-white transition-colors">{feature.title}</h3>
                        <p className="text-base text-white/80">{feature.description}</p>
                    </div>
                </div>
                <ArrowRight className="w-6 h-6 flex-shrink-0 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" style={{ color: accentColor }} />
            </div>
        </Link>
    );
}

// Hero Section Component
function HeroSection() {
    return (
        <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight drop-shadow-2xl">Revolutionize Your School</h2>
            {/* // state of the art , 3 portal view, connecting administration, student, and teeachers to the same lesson*/}
            <p className="text-xs text-secondary/60 font-mono tracking-wider">We facilitate an easy ‘next generation’ solution, managing student registration, booking progress and lesson payments.</p>
            <p className="text-xs text-secondary/60 font-mono tracking-wider">Read more below.</p>
        </div>
    );
}

// Features Grid Component
function FeaturesGrid() {
    return (
        <div className="relative pt-8">
            <div className="grid grid-cols-1 gap-6">
                {FEATURES.map((feature, index) => (
                    <FeatureCard key={index} feature={feature} />
                ))}
            </div>
            {/* Meet the Founder */}
            <Link href="/docs" className="absolute -bottom-16 right-0 flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white transition-all duration-300">
                <User className="w-4 h-4" />
                <span className="text-xs font-medium">Meet the Founder</span>
            </Link>
        </div>
    );
}

export function LandingDescription() {
    const [showNavbar, setShowNavbar] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollContainer = document.querySelector(".snap-y");
            if (scrollContainer) {
                const scrollPosition = scrollContainer.scrollTop;
                const viewportHeight = window.innerHeight;
                setShowNavbar(scrollPosition > viewportHeight * 0.5);
            }
        };

        const scrollContainer = document.querySelector(".snap-y");
        scrollContainer?.addEventListener("scroll", handleScroll);
        return () => scrollContainer?.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section className="h-screen snap-start relative overflow-hidden bg-sky-900">
            <BackgroundImage
                src="/kritaps_ungurs_unplash/wave-wide.jpg"
                position="absolute"
                overlay="linear-gradient(to bottom, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.8) 8%, rgba(15, 23, 42, 0.3) 15%, transparent 25%, transparent 75%, rgba(0, 0, 0, 1) 100%)"
                priority
            />

            {/* Photo Credit */}
            <Link
                href="https://unsplash.com/@kristapsungurs"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 hover:bg-black/50 text-white/70 hover:text-white transition-all duration-300 backdrop-blur-sm group"
            >
                <Camera className="w-4 h-4" />
                <span className="text-xs font-medium">Kristaps Ungurs</span>
            </Link>

            <div className="relative z-10 h-full flex items-center justify-center px-4">
                <div className="max-w-4xl space-y-10 text-center">
                    <HeroSection />
                    <FeaturesGrid />
                </div>
            </div>
        </section>
    );
}
