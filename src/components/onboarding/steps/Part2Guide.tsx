"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const BLUE_BG_GO = "bg-slate-950";
const PUNCH_WORDS = "text-white font-bold";
const KEY_WORDS = "text-xl text-white";

const ANIMATION_DELAYS = {
    part2: 0.2,
    teacherSorting: 0.5,
    classboard: 1.0,
    studentPackage: 1.5,
} as const;

function AdrImageSection() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 1.2 }}
            viewport={{ once: true, amount: 0.5 }}
            className="flex items-center justify-end gap-4 pt-6"
        >
            <motion.div
                initial={{ x: -400, rotate: 360 }}
                whileInView={{ x: 0, rotate: 0 }}
                transition={{ delay: 2.0, duration: 1.4, type: "spring", stiffness: 100, damping: 15 }}
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
        </motion.div>
    );
}

function Part2Header() {
    return (
        <div className="relative inline-block">
            <h1 className="relative text-7xl md:text-9xl font-bold tracking-tight drop-shadow-2xl" style={{ zIndex: 10 }}>
                Part 2
            </h1>
        </div>
    );
}

export function Part2Description() {
    return (
        <div className="max-w-3xl mx-auto mt-8 px-4 space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ANIMATION_DELAYS.teacherSorting, duration: 0.8 }}
                className="text-xl md:text-2xl text-gray-300 text-center leading-relaxed"
            >
                <span className={PUNCH_WORDS}>How Teacher Sorting</span>{" "}
                <span className="text-gray-400 italic">and</span>{" "}
                <span className={PUNCH_WORDS}>Status Go</span>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ANIMATION_DELAYS.classboard, duration: 0.8 }}
                className="text-xl md:text-2xl text-gray-300 text-center leading-relaxed"
            >
                <span className={PUNCH_WORDS}>Classboard</span>{" "}
                <span className={KEY_WORDS}>Introduction</span>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ANIMATION_DELAYS.studentPackage, duration: 0.8 }}
                className="text-xl md:text-2xl text-gray-300 text-center leading-relaxed"
            >
                <span className={PUNCH_WORDS}>Student Package</span>{" "}
                <span className={KEY_WORDS}>Request</span>
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

export function Part2Guide() {
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
                    {/* Part2Header - Absolutely positioned to stay centered */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Part2Header />
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex flex-col items-center justify-end pb-20 gap-8">
                        <Part2Description />
                    </div>
                </div>
            </div>
        </section>
    );
}
