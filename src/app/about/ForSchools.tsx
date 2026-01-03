"use client";

import React from "react";
import Link from "next/link";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";

export function ForSchools() {
    return (
        <div className="w-full py-24 px-6 bg-blue-50/30">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">For Schools</h2>
                    <p className="text-lg text-slate-500">Comprehensive Management</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-center divide-y md:divide-y-0 divide-blue-200/50">
                    <div className="w-full py-8 md:py-0">
                        <FeatureCard
                            title="A Classboard"
                            icon={<IPadIcon />}
                        />
                    </div>
                    <div className="w-full py-8 md:py-0">
                        <FeatureCard
                            title="Booking Keeping"
                            icon={<MagicBookIcon />}
                        />
                    </div>
                    <div className="w-full py-8 md:py-0">
                        <FeatureCard
                            title="Equipment Tracking"
                            icon={<EquipmentIcon size={48} className="text-blue-500/70" />}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ title, icon, link }: { title: string; icon: React.ReactNode; link?: string }) {
    const content = (
        <div className="flex flex-col items-center text-center space-y-6 h-full">
            <div className="text-blue-500/70">
                {icon}
            </div>
            <h4 className="text-lg font-bold text-slate-400 uppercase tracking-wide">{title}</h4>
        </div>
    );

    if (link) {
        return (
            <Link href={link} className="block w-full hover:scale-105 transition-transform duration-200">
                {content}
            </Link>
        );
    }
    
    return <div className="w-full">{content}</div>;
}

function IPadIcon() {
    return (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 7h6M9 10h6M9 13h3" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
    );
}

function MagicBookIcon() {
    return (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
             <path d="M14 3l1 1-1 1M17 5l1 1-1 1" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
    );
}
