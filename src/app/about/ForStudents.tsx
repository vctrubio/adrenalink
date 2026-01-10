"use client";

import React from "react";
import Link from "next/link";

export function ForStudents() {
    return (
        <div className="w-full py-24 px-6 bg-white">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">For Students</h2>
                    <p className="text-lg text-slate-500">Your Path to Progression</p>
                </div>

                <div className="flex flex-col md:flex-row justify-center md:justify-around gap-0 md:gap-12 divide-y md:divide-y-0 divide-slate-100">
                    <div className="w-full md:w-1/3 max-w-sm mx-auto py-12 md:py-0">
                        <FeatureCard
                            title="Live Synchronization"
                            icon={<SatelliteIcon />}
                        />
                    </div>
                    <div className="w-full md:w-1/3 max-w-sm mx-auto py-12 md:py-0">
                        <FeatureCard
                            title="Explore School"
                            link="/discover"
                            icon={<LighthouseIcon />}
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

function SatelliteIcon() {
    return (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
    );
}

function LighthouseIcon() {
    return (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            <path d="M12 2v1M12 21v1M4.22 4.22l.707.707M19.07 19.07l.707.707M2 12h1M21 12h1M4.22 19.78l.707-.707M19.07 4.93l.707-.707" strokeWidth={1} opacity={0.5} />
        </svg>
    );
}
