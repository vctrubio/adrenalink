"use client";

import { useEffect, useRef, useState } from "react";
import { LandingPortals } from "./landing-portals";
import { AnimatedCanvas } from "./animated-canvas";

const BLUE_BG_GO = "bg-slate-900"; // Dark mode background color - #0F172A

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
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeWindow, setActiveWindow] = useState<"hero" | "portals">("hero");

    const scrollToWindow = (window: "hero" | "portals") => {
        setActiveWindow(window);
        if (containerRef.current) {
            const scrollPosition = window === "hero" ? 0 : containerRef.current.scrollWidth / 2;
            containerRef.current.scrollTo({
                left: scrollPosition,
                behavior: "smooth",
            });
        }
    };

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

            const centerX = wavesCanvas.width / 2;
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
        <section
            ref={containerRef}
            className={`h-screen snap-start relative w-full overflow-x-scroll snap-x snap-mandatory ${BLUE_BG_GO}`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
            {/* Waves Canvas - Always present */}
            <canvas ref={wavesCanvasRef} className="absolute inset-0 w-full h-full" />

            {/* Sliding Container */}
            <div className="relative z-10 w-[200vw] h-full flex">
                {/* Hero Window - Left */}
                <div className="w-screen h-full flex-shrink-0 flex flex-col snap-start snap-always relative">
                    {/* Centered content area */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-8">
                        <LandingHeroHeader />
                        <LandingHeroDescription />
                    </div>

                    {/* Toggle Button - Bottom Center of Hero Window */}
                    <div className="pb-20 flex justify-center">
                        <button
                            onClick={() => scrollToWindow("portals")}
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl text-white font-semibold transition-all duration-200 shadow-xl"
                        >
                            View Portals →
                        </button>
                    </div>
                </div>

                {/* Portals Window - Right */}
                <div className="w-screen h-full flex-shrink-0 flex flex-col snap-start snap-always relative">
                    <div className="flex-1 flex items-center justify-center">
                        <LandingPortals />
                    </div>

                    {/* Toggle Button - Bottom Center of Portals Window */}
                    <div className="pb-20 flex justify-center">
                        <button
                            onClick={() => scrollToWindow("hero")}
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl text-white font-semibold transition-all duration-200 shadow-xl"
                        >
                            ← Back to Hero
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                section::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
