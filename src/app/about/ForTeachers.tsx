"use client";

import React from "react";
import Link from "next/link";
import WindSpeed from "@/public/appSvgs/WindSpeed";
import { motion } from "framer-motion";

export function ForTeachers() {
    return (
        <div className="w-full py-24 px-6 bg-blue-50/30">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">For Teachers</h2>
                    <p className="text-lg text-slate-500">Empowering Instructors</p>
                </div>

                <div className="flex justify-center">
                    <div className="w-full max-w-sm">
                        <FeatureCard title="Get to know more..." link="/discover" icon={<AnimatedWindIcon />} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function AnimatedWindIcon() {
    return (
        <motion.div
            whileHover={{ rotate: 180, scale: 1.2 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            className="text-blue-500/70"
        >
            <WindSpeed size={48} />
        </motion.div>
    );
}

function FeatureCard({ title, icon, link }: { title: string; icon: React.ReactNode; link?: string }) {
    const content = (
        <div className="flex flex-col items-center text-center space-y-6 h-full">
            <div>{icon}</div>
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
