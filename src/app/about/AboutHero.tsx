"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatedCanvas } from "@/src/landing/animated-canvas";

const BG_COLOR = "bg-white";

function AboutHeroHeader() {
    return (
        <div className="relative inline-block">
            <AnimatedCanvas className="absolute inset-0 w-full h-full pointer-events-none" />
            <h1
                className="relative text-7xl md:text-9xl font-bold tracking-tight drop-shadow-2xl text-slate-900"
                style={{ zIndex: 10 }}
            >
                Adrenalink
            </h1>
        </div>
    );
}

export function AboutHero() {
    const wavesCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const wavesCanvas = wavesCanvasRef.current;
        if (!wavesCanvas) return;

        const ctx = wavesCanvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        const resizeCanvas = () => {
            wavesCanvas.width = window.innerWidth;
            wavesCanvas.height = window.innerHeight;
        };

        const draw = () => {
            time += 0.005;
            ctx.clearRect(0, 0, wavesCanvas.width, wavesCanvas.height);

            const centerY = wavesCanvas.height / 2;

            // Multiple wave layers with different frequencies
            for (let layer = 0; layer < 3; layer++) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 - layer * 0.04})`;
                ctx.lineWidth = 2;

                for (let x = 0; x < wavesCanvas.width; x += 3) {
                    const wave1 = Math.sin(x * 0.01 + time + layer) * 40;
                    const wave2 = Math.sin(x * 0.005 + time * 0.5 + layer * 2) * 25;
                    const y = centerY + wave1 + wave2;

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
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
        <section className={`h-screen w-full ${BG_COLOR} flex flex-col items-center justify-center relative overflow-hidden`}>
            {/* Waves Canvas - Always present */}
            <canvas ref={wavesCanvasRef} className="absolute inset-0 w-full h-full" />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
                <AboutHeroHeader />

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 flex flex-col items-center gap-2 animate-bounce opacity-50">
                    <span className="text-sm uppercase tracking-widest text-slate-500">Scroll to explore</span>
                    <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </div>
        </section>
    );
}
