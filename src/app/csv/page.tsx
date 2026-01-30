"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import PackageIcon from "@/public/appSvgs/PackageIcon";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";

// --- Sub-Components ---

function SchoolSection() {
    return (
        <section className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 border-t border-slate-200">
            <div className="max-w-4xl w-full flex flex-col items-center text-center gap-8">
                <div className="p-8 rounded-full bg-indigo-100 text-indigo-600">
                    <AdminIcon size={80} className="w-20 h-20" />
                </div>
                <h2 className="text-5xl font-black tracking-tight text-slate-900">Schools</h2>
                <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
                    Manage your institution with precision. Comprehensive tools for student tracking, 
                    scheduling, and operational oversight.
                </p>
            </div>
        </section>
    );
}

function PackagesSection() {
    return (
        <section className="min-h-screen flex flex-col items-center justify-center p-8 bg-white border-t border-slate-200">
            <div className="max-w-4xl w-full flex flex-col items-center text-center gap-8">
                <div className="p-8 rounded-full bg-orange-100 text-orange-600">
                    <PackageIcon size={80} className="w-20 h-20" />
                </div>
                <h2 className="text-5xl font-black tracking-tight text-slate-900">Packages</h2>
                <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
                    Flexible pricing and lesson bundles. Create custom offerings that suit 
                    every student's journey and budget.
                </p>
            </div>
        </section>
    );
}

function EquipmentsSection() {
    return (
        <section className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 border-t border-slate-200">
            <div className="max-w-4xl w-full flex flex-col items-center text-center gap-8">
                <div className="p-8 rounded-full bg-purple-100 text-purple-600">
                    <EquipmentIcon size={80} className="w-20 h-20" />
                </div>
                <h2 className="text-5xl font-black tracking-tight text-slate-900">Equipments</h2>
                <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
                    Track inventory, manage rentals, and ensure gear safety. 
                    Real-time status updates for all your school's assets.
                </p>
            </div>
        </section>
    );
}

// --- Main Page Component ---

export default function CsvPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // Animation thresholds (in pixels)
    const SCROLL_THRESHOLD = 150;

    // Logo & Adrenalink (Exit)
    const opacityLogo = useTransform(scrollY, [0, SCROLL_THRESHOLD], [1, 0]);
    const yLogo = useTransform(scrollY, [0, SCROLL_THRESHOLD], [0, -50]);
    const scaleLogo = useTransform(scrollY, [0, SCROLL_THRESHOLD], [1, 0.8]);

    // Administration (Enter)
    const opacityAdmin = useTransform(scrollY, [0, SCROLL_THRESHOLD], [0, 1]);
    const yAdmin = useTransform(scrollY, [0, SCROLL_THRESHOLD], [50, 0]);
    const scaleAdmin = useTransform(scrollY, [0, SCROLL_THRESHOLD], [0.8, 1]);

    return (
        <main className="bg-background relative">
            {/* Sticky Header */}
            <div className="fixed top-0 left-0 right-0 h-24 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="relative w-full max-w-7xl px-8 h-full flex items-center gap-4">
                    
                    {/* Stationary Logo */}
                    <Image
                        src="/ADR.webp"
                        alt="Adrenalink Logo"
                        width={48}
                        height={48}
                        className="object-contain"
                        priority
                    />

                    {/* Text Container for Transition */}
                    <div className="relative h-10 w-full flex items-center">
                        {/* Text 1: Adrenalink (Exit) */}
                        <motion.span 
                            style={{ opacity: opacityLogo, y: yLogo }}
                            className="absolute left-0 text-3xl font-black tracking-tighter text-foreground origin-left"
                        >
                            Adrenalink
                        </motion.span>

                        {/* Text 2: Administration (Enter) */}
                        <motion.span 
                            style={{ opacity: opacityAdmin, y: yAdmin }}
                            className="absolute left-0 text-3xl font-black tracking-tighter text-secondary origin-left"
                        >
                            Administration
                        </motion.span>
                    </div>

                </div>
            </div>

            {/* Spacer for fixed header */}
            <div className="h-24" />

            {/* Content Sections */}
            <SchoolSection />
            <PackagesSection />
            <EquipmentsSection />
        </main>
    );
}