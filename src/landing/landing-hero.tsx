"use client";

import { useEffect, useRef } from "react";
import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const BLUE_BG_GO = "bg-slate-950";
const PUNCH_WORDS = "text-white font-bold";
const HIGHLIGHT_SPAN_CLASSNAME = "border-b border-secondary/50 tracking-wider";
const KEY_WORDS = "text-xl text-white";

const ANIMATION_DELAYS = {
    connecting: 0.2,
    schools: 0.5,
    students: 0.9,
    and: 1.0,
    teachers: 1.3,
    toSynchronize: 1.7,
    lessonPlanning: 1.75,
    smartAutomation: 1.9,
    andAfterAutomation: 1.95,
    equipmentTracking: 2.1,
    period: 2.15,
    comma: 2.15,
} as const;

function AdrImageSection() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 6.3, duration: 1.2 }}
            viewport={{ once: true, amount: 0.5 }}
            className="flex items-center justify-end gap-4 pt-6"
        >
            <motion.div
                initial={{ x: -400, rotate: 360 }}
                whileInView={{ x: 0, rotate: 0 }}
                transition={{ delay: 6.3, duration: 1.4, type: "spring", stiffness: 100, damping: 15 }}
                viewport={{ once: true, amount: 0.5 }}
            >
                <Image
                    src="/ADR.webp"
                    alt="Adrenalink"
                    width={120}
                    height={120}
                    className="filter brightness-0 saturate-100"
                    style={{ filter: "brightness(0) saturate(100%) hue-rotate(30deg) drop-shadow(0 0 8px rgba(251, 146, 60, 0.4))" }}
                />
            </motion.div>
            <motion.div
                className="flex flex-col items-center gap-0"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 6.5, duration: 0.6 }}
                viewport={{ once: true, amount: 0.5 }}
                whileHover={{ scale: 1.05 }}
            >
                <motion.div
                    className="text-lg md:text-xl leading-none font-black"
                    style={{ color: "rgb(251, 146, 60)", letterSpacing: "0.15em" }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 1.5, repeat: 2, ease: "easeInOut" }}
                >
                    Gamified
                </motion.div>
                <div
                    className="text-sm leading-none"
                    style={{ color: "rgba(251, 146, 60, 0.5)", textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)" }}
                >
                    &
                </div>
                <motion.div
                    className="text-lg md:text-xl leading-none font-black"
                    style={{ color: "rgb(251, 146, 60)", letterSpacing: "0.15em" }}
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: 2, ease: "easeInOut" }}
                >
                    Simplified
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

function LandingHeroHeader() {
    return (
        <div className="relative inline-block">
            <h1 className="relative text-7xl md:text-9xl font-bold tracking-tight drop-shadow-2xl" style={{ zIndex: 10 }}>
                Adrenalink
            </h1>
        </div>
    );
}

function ThreeWayConnection({ word }: { word: string }) {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <span
            className={`relative inline-block cursor-pointer px-1 text-gray-400 ${isHovered ? "font-bold" : ""}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {word}
            {isHovered && (
                <span
                    className="absolute inset-0 -z-10"
                    style={{
                        backgroundColor: "rgb(59, 130, 246)",
                        opacity: 0.8,
                    }}
                />
            )}
        </span>
    );
}

function LandingShortDesc() {
    return (
        <div className="max-w-2xl mx-auto px-4 mt-8 relative">
            <p 
                className="text-base md:text-lg text-gray-300 font-mono tracking-wide leading-relaxed text-center relative z-10"
                style={{ 
                    fontFamily: "ui-monospace, SFMono-Regular, \"SF Mono\", Menlo, Consolas, \"Liberation Mono\", monospace",
                    letterSpacing: "0.05em",
                    lineHeight: "1.6"
                }}
            >
                <span className="text-white font-semibold">Connecting</span>{" "}
                
                <ThreeWayConnection word="schools" />
                <span className="text-gray-400">,{" "}</span>
                <ThreeWayConnection word="students" />{" "}
                <span className="text-gray-400">and</span>{" "}
                <ThreeWayConnection word="teachers" />{" "}
                
                <span className="text-white font-semibold">to synchronize</span>{" "}
                <span className="text-gray-400">lesson planning, with</span>{" "}
                
                <span className="text-white font-semibold">smart automation</span>{" "}
                <span className="text-gray-400">and</span>{" "}
                
                <span className="text-white font-semibold">equipment tracking</span>
                <span className="text-gray-500">.</span>
            </p>
        </div>
    );
}

export function LandingHeroDescription() {
    return (
        <div className="max-w-3xl mx-auto mt-8 px-4 space-y-2">
            <div className="text-xl md:text-2xl font-semibold text-center leading-relaxed">
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-secondary text-xl md:text-2xl tracking-wise"
                >
                    Our technology
                </motion.span>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-gray-400 mx-1"
                >
                    <span className="italic">mints</span> the next generation of
                </motion.span>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.8 }}
                    className={PUNCH_WORDS}
                >
                    Adrenaline Activity
                </motion.span>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.8 }}
                    className="text-gray-400"
                >
                    .
                </motion.span>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="space-y-2 flex flex-col-reverse md:flex-col"
            >
                <div className="text-xl text-gray-300 text-center">
                    <span className={PUNCH_WORDS}>We</span> <span className={PUNCH_WORDS}>connect</span>{" "}
                    <span className={HIGHLIGHT_SPAN_CLASSNAME}>
                        <span className="text-secondary tracking-widest">schools</span> with{" "}
                        <span className="text-secondary tracking-widest">students</span> and{" "}
                        <span className="text-secondary tracking-widest">teachers</span>
                    </span>{" "}
                    <span className="text-gray-400 italic">to</span>{" "}
                    <span className={`tracking-wide ${KEY_WORDS}`}>synchronize lessons</span>.
                </div>
                <div className="text-xl text-gray-300 text-center">
                    <span className={PUNCH_WORDS}>Facilitating</span> <span className={KEY_WORDS}>bookings</span>,{" "}
                    <span className={KEY_WORDS}>payments</span>, <span className="text-gray-400 italic">and</span>{" "}
                    <span className={KEY_WORDS}>communication</span>,
                </div>
                <div className="text-xl text-gray-300 text-center">
                    <span className={PUNCH_WORDS}>Adrenalink</span> is <span className="font-bold text-white">built</span> to{" "}
                    <span className={KEY_WORDS}>track equipment usage</span>, <span className="text-gray-400 italic">with</span>{" "}
                    <span className={KEY_WORDS}>smart automation</span>.
                </div>
            </motion.div>

            <div className="md:hidden absolute top-4 right-4 z-20">
                <AdrImageSection />
            </div>

            <div className="hidden md:block">
                <AdrImageSection />
            </div>
        </div>
    );
}

export function LandingHero() {
    const wavesCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const wavesCanvas = wavesCanvasRef.current;
        if (!wavesCanvas) return;

        const ctx = wavesCanvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let time = 0;
        const introStartTime = Date.now();
        const INTRO_DURATION = 4500;
        const PARTICLE_DELAY = 2000;
        const PARTICLE_FADE_DURATION = 6000;

        const resizeCanvas = () => {
            wavesCanvas.width = window.innerWidth;
            wavesCanvas.height = window.innerHeight;
        };

        const draw = () => {
            time += 0.005;
            const elapsed = Date.now() - introStartTime;

            // Wave progress
            const introProgress = Math.min(elapsed / INTRO_DURATION, 1);
            const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
            const waveProgress = easeOutCubic(introProgress);

            // Particle progress
            const particleElapsed = Math.max(0, elapsed - PARTICLE_DELAY);
            const particleProgress = Math.min(particleElapsed / PARTICLE_FADE_DURATION, 1);

            ctx.clearRect(0, 0, wavesCanvas.width, wavesCanvas.height);

            const centerX = wavesCanvas.width / 2;
            const centerY = wavesCanvas.height / 2;

            // Multiple wave layers with entrance scaling
            for (let layer = 0; layer < 3; layer++) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(59, 130, 246, ${(0.15 - layer * 0.04) * waveProgress})`;
                ctx.lineWidth = 2;

                for (let x = 0; x < wavesCanvas.width; x += 3) {
                    // Amplitude starts at 0 and grows with progress
                    const wave1 = Math.sin(x * 0.01 + time + layer) * (40 * waveProgress);
                    const wave2 = Math.sin(x * 0.005 + time * 0.5 + layer * 2) * (25 * waveProgress);
                    const y = centerY + wave1 + wave2;

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            // Floating particles appearing in after delay
            if (particleProgress > 0) {
                // Particles
                for (let i = 0; i < 50; i++) {
                    const angle = (i / 50) * Math.PI * 2 + time;
                    const radius = 100 + Math.sin(time * 2 + i) * 50;
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius * 0.5;

                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(59, 130, 246, ${(0.6 + Math.sin(time + i) * 0.4) * particleProgress})`;
                    ctx.fill();
                }
            }

            animationId = requestAnimationFrame(draw);
        };

        resizeCanvas();
        draw();

        window.addEventListener("resize", resizeCanvas);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    return (
        <section className={`h-screen snap-start snap-always relative w-full ${BLUE_BG_GO}`}>
            {/* Waves Canvas - Always present */}
            <canvas ref={wavesCanvasRef} className="absolute inset-0 w-full h-full" />

            {/* Content Container */}
            <div className="relative z-10 w-screen h-full flex flex-col">
                <div className="w-full h-full flex flex-col relative">
                    {/* LandingHeroHeader - Absolutely positioned to stay centered */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <LandingHeroHeader />
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex flex-col items-center justify-end pb-20 gap-8">
                        <LandingShortDesc />
                    </div>
                </div>
            </div>
        </section>
    );
}
