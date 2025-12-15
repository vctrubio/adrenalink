"use client";

import { useEffect, useRef, useState } from "react";
import { LandingPortals } from "./landing-portals";
import { AnimatedCanvas } from "./animated-canvas";

const BLUE_BG_GO = ""; // Use inherited background

function LandingHeroHeader() {
    return (
        <div className="relative inline-block">
            <AnimatedCanvas className="absolute inset-0 w-full h-full pointer-events-none" />
            <h1 className="relative text-7xl md:text-9xl font-bold tracking-tight drop-shadow-2xl" style={{ zIndex: 10 }}>
                Adrenalink
            </h1>
        </div>
    );
}

function LandingHeroDescription() {
    return (
        <div className="max-w-3xl mx-auto mt-8 px-4 space-y-2">
            <div className="text-base md:text-lg text-gray-300 text-center">
                <span className="font-bold text-secondary">Our technology</span> mints the next community of <span className="font-bold">adrenaline</span> junkies.
            </div>
            <div className="text-base md:text-lg text-gray-300 text-center">
                We <span className="underline">connect students with schools</span> and fully automate their booking schedules.
            </div>
            <div className="text-base md:text-lg text-gray-300 text-center">
                Tracking <span className="italic">teacher commissions</span>, <span className="italic">lesson planning</span>, and <span className="italic">equipment handling</span>..
            </div>
            <div className="text-base md:text-lg text-gray-300 text-center">
                <span className="font-bold">Join us</span> in building a new home for outdoor activity.
            </div>

            <div className="text-base md:text-lg text-[#fb923c] text-right  ">Gamified and Simplyfied</div>
        </div>
    );
}

export function LandingHero() {
    const wavesCanvasRef = useRef<HTMLCanvasElement>(null);
    const [activeWindow, setActiveWindow] = useState<"hero" | "portals">("hero");

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
        <section className={`h-screen snap-start relative w-full ${BLUE_BG_GO}`}>
            {/* Waves Canvas - Always present */}
            <canvas ref={wavesCanvasRef} className="absolute inset-0 w-full h-full" />

            {/* Content Container */}
            <div className="relative z-10 w-screen h-full flex flex-col">
                {/* Hero Window */}
                {activeWindow === "hero" && (
                    <div className="w-full h-full flex flex-col relative">
                        {/* LandingHeroHeader - Absolutely positioned to stay centered */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <LandingHeroHeader />
                        </div>

                        {/* Spacer to push other content to the bottom */}
                        <div className="flex-1"></div>

                        {/* LandingHeroDescription and Toggle Button at the bottom */}
                        <div className="flex flex-col items-center justify-end pb-20 gap-8">
                            <LandingHeroDescription />
                            <button onClick={() => setActiveWindow("portals")} className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl text-white font-semibold transition-all duration-200 shadow-xl">
                                View Portals →
                            </button>
                        </div>
                    </div>
                )}

                {/* Portals Window */}
                {activeWindow === "portals" && (
                    <div className="w-full h-full flex flex-col relative">
                        <div className="flex-1 flex items-center justify-center">
                            <LandingPortals />
                        </div>

                        {/* Toggle Button - Bottom Center */}
                        <div className="pb-20 flex justify-center">
                            <button onClick={() => setActiveWindow("hero")} className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl text-white font-semibold transition-all duration-200 shadow-xl">
                                ← Back to Hero
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
