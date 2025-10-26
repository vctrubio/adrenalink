"use client";

import { useEffect, useState } from "react";
import { DollarSign, Database, Camera } from "lucide-react";
import FloatingNav from "@/src/components/navigations/FloatingNav";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import BookingCompleteIcon from "@/public/appSvgs/BookingCompleteIcon";
import RegistrationIcon from "@/public/appSvgs/RegistrationIcon";
import Link from "next/link";

// Feature data based on your handwritten notes
const FEATURES = [
    {
        icon: EquipmentIcon,
        title: "Equipment Tracking",
        description: "See how many hours of flight time before you need to sell",
    },
    {
        icon: FlagIcon,
        title: "Lesson Management",
        description: "Easily create lessons, and receive feedback + confirmation",
    },
    {
        icon: BookingCompleteIcon,
        title: "Booking Progress",
        description: "Track the number of hours vs expected hours",
    },
    {
        icon: DollarSign,
        title: "Statistics Review",
        description: "Filter stats by months, weeks or days",
    },
    {
        icon: Database,
        title: "One Source of Truth",
        description: "Centralized data management visible to everyone",
    },
    {
        icon: RegistrationIcon,
        title: "3 Apps in 1",
        description: "Student, teacher and Admin Dashboards",
    },
];

// Feature Card Component
function FeatureCard({ feature }: { feature: (typeof FEATURES)[0] }) {
    const IconComponent = feature.icon;

    return (
        <div className="p-6 rounded-lg border border-secondary/60 bg-card/20 backdrop-blur-sm hover:border-secondary hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-3">
                <IconComponent className="w-6 h-6 text-secondary group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold group-hover:scale-105 transition-transform">{feature.title}</h3>
            </div>
            <p className="text-sm text-white/80">{feature.description}</p>
        </div>
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
        <div className="grid md:grid-cols-3 gap-6 pt-4">
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
            {/* Background Wave Image */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: "url(/kritaps_ungurs_unplash/wave-wide.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />

            {/* Gradient Overlay - top blend with hero, bottom blend with footer */}
            <div
                className="absolute inset-0 z-[1]"
                style={{
                    background: "linear-gradient(to bottom, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.8) 8%, rgba(15, 23, 42, 0.3) 15%, transparent 25%, transparent 75%, rgba(0, 0, 0, 1) 100%)",
                }}
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
