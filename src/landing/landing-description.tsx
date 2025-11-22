"use client";

import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { BackgroundImage } from "@/src/components/BackgroundImage";
import FloatingNav from "@/src/components/navigations/FloatingNav";
import OpenBookIcon from "@/public/appSvgs/OpenBookIcon";
import MagnifyingGlassIcon from "@/public/appSvgs/MagnifyingGlassIcon";
import OnboardingAndPricingIcon from "@/public/appSvgs/OnboardingAndPricingIcon";
import Link from "next/link";

// Feature data with call-to-action links
const FEATURES = [
    {
        icon: OpenBookIcon,
        title: "Read the manual",
        description: "Complete documentation and guides",
        link: "/docs/manual",
    },
    {
        icon: MagnifyingGlassIcon,
        title: "What We Do",
        description: "Discover our mission and values",
        link: "/docs/wwd",
    },
    {
        icon: OnboardingAndPricingIcon,
        title: (
            <>
                <span className="text-secondary font-bold" style={{ WebkitTextStroke: "1px black", textShadow: "0 0 2px rgb(59, 130, 246)" }}>
                    Onboarding
                </span>{" "}
                &{" "}
                <span className="text-primary font-bold" style={{ WebkitTextStroke: "1px black", textShadow: "0 0 2px rgb(22, 163, 74)" }}>
                    Pricing
                </span>
            </>
        ),
        description: "Get started and view our plans",
        link: "/docs/pricing",
    },
];

// Feature Card Component
function FeatureCard({ feature }: { feature: (typeof FEATURES)[0] }) {
    const IconComponent = feature.icon;

    return (
        <Link href={feature.link} className="block p-6 rounded-lg border border-secondary/60 bg-card/20 backdrop-blur-sm hover:border-secondary hover:shadow-xl transition-all duration-300 group cursor-pointer">
            <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1">
                    <IconComponent className="w-12 h-12 text-black group-hover:scale-110 transition-transform" />
                    <div>
                        <h3 className="text-xl font-semibold group-hover:scale-105 transition-transform mb-1">{feature.title}</h3>
                        <p className="text-sm text-white/80">{feature.description}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Hero Section Component
function HeroSection() {
    return (
        <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight drop-shadow-2xl">Revolutionize Your School</h2>
            <p className="text-xs text-secondary/60 font-mono tracking-wider">NextGen™ Sports Management Solutions</p>
        </div>
    );
}

// Features Grid Component
function FeaturesGrid() {
    return (
        <div className="flex flex-col gap-4 pt-4">
            {FEATURES.map((feature, index) => (
                <FeatureCard key={index} feature={feature} />
            ))}
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

            <FloatingNav show={showNavbar} slogan="streamlining the experience" />

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
