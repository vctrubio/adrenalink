"use client";

import { AboutHero } from "./AboutHero";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ForSchools } from "./ForSchools";
import { ForStudents } from "./ForStudents";
import { ForTeachers } from "./ForTeachers";

export default function AboutPage() {
    const router = useRouter();
    const [isExploding, setIsExploding] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);

    // We want a longer scroll range to make it feel "slower"
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Track visibility of the Big Logo to toggle the Top-Left Logo
    const { scrollYProgress: logoVisibilityProgress } = useScroll({
        target: logoRef,
        offset: ["start end", "end start"], // 0 = enters viewport bottom, 1 = leaves viewport top
    });

    // Top-left logo opacity: Visible (1) when big logo is hidden, fades to 0 when big logo is visible
    const topLeftLogoOpacity = useTransform(logoVisibilityProgress, [0, 0.2, 0.8, 1], [1, 0, 0, 1]);
    const topLeftLogoScale = useTransform(logoVisibilityProgress, [0, 0.2, 0.8, 1], [1, 0.5, 0.5, 1]);

    // Slower parallax for the icon: it moves less than the scroll
    const yIcon = useTransform(scrollYProgress, [0, 1], [0, -300]);
    const opacityIcon = useTransform(scrollYProgress, [0, 0.05, 0.9, 1], [0, 1, 1, 0]);
    const scaleIcon = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            if (latest > 0.95 && !isExploding) {
                setIsExploding(true);
            }
        });
        return () => unsubscribe();
    }, [scrollYProgress, isExploding]);

    useEffect(() => {
        if (isExploding) {
            const timer = setTimeout(() => {
                router.push("/about/v2");
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [isExploding, router]);

    return (
        <main className="bg-white relative">
            <AnimatePresence>
                {isExploding && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 100 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="fixed inset-0 z-[100] bg-white rounded-full pointer-events-none"
                        style={{ transformOrigin: "center center" }}
                    />
                )}
            </AnimatePresence>

            {/* Fixed Top-Left Logo */}
            <motion.div
                style={{ opacity: topLeftLogoOpacity, scale: topLeftLogoScale }}
                className="fixed top-8 left-8 z-50 w-16 h-16 pointer-events-none mix-blend-difference"
            >
                <Image src="/ADR.webp" alt="Adrenalink Logo" fill className="object-contain" />
            </motion.div>

            {/* Fixed Background Hero - does not move */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AboutHero />
            </div>

            {/* Scrolling Layer */}
            <div ref={containerRef} className="relative z-10 min-h-[400vh]">
                {/* Initial transparent section to see the hero */}
                <div className="h-screen" />

                {/* The "Paper" content - narrower, sliding over */}
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-white rounded-t-[3rem] shadow-[0_-40px_100px_rgba(0,0,0,0.1)] min-h-screen">
                        {/* Icon overscroll area */}
                        <div ref={logoRef} className="relative h-[80vh] flex items-center justify-center overflow-hidden -mt-32">
                            <motion.div
                                style={{ y: yIcon, opacity: opacityIcon, scale: scaleIcon }}
                                className="relative w-[80vw] h-[60vh] md:w-[60vw] md:h-[70vh]"
                            >
                                <Image src="/ADR.webp" alt="Adrenalink" fill className="object-contain" priority />
                            </motion.div>
                        </div>

                        {/* 3-Way Sections */}
                        <div className="flex flex-col w-full overflow-hidden rounded-b-[3rem] mt-10">
                            <ForSchools />
                            <ForStudents />
                            <ForTeachers />
                        </div>
                    </div>
                </div>

                {/* Final spacer - reduced to ensure trigger hits naturally */}
                <div className="h-[20vh]" />
            </div>
        </main>
    );
}
