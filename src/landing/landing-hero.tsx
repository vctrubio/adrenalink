"use client";

import { useEffect, useRef } from "react";

const BLUE_BG_GO = "bg-slate-900"; // Dark mode background color - #0F172A

function LandingHeroHeader({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement> }) {
    return (
        <div className="relative inline-block">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            <h1 className="relative text-7xl md:text-9xl font-bold tracking-tight drop-shadow-2xl" style={{ zIndex: 10 }}>
                Adrenalink
            </h1>
        </div>
    );
}

function LandingHeroSlogan() {
    return (
        <div className="flex flex-col items-center gap-4 text-xl md:text-2xl text-secondary tracking-wide drop-shadow-lg">
            <div className="text-center">Are you</div>
            <div className="flex gap-8 text-base md:text-lg">
                <div className="text-left">a student looking for lessons?</div>
                <div className="text-right">a school looking to automate planning?</div>
            </div>
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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wavesCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                const rect = parent.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
            }
        };

        const draw = () => {
            time += 0.01;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Create flowing wave patterns
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Multiple wave layers with different frequencies
            for (let layer = 0; layer < 3; layer++) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 - layer * 0.03})`;
                ctx.lineWidth = 2;

                for (let x = 0; x < canvas.width; x += 2) {
                    const wave1 = Math.sin(x * 0.01 + (time * 2 + layer)) * 50;
                    const wave2 = Math.sin(x * 0.005 + (time * 1.5 + layer * 2)) * 30;
                    const wave3 = Math.sin(x * 0.02 + (time * 3 + layer * 3)) * 20;
                    const y = centerY + wave1 + wave2 + wave3;

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            // Floating particles
            for (let i = 0; i < 50; i++) {
                const angle = (i / 50) * Math.PI * 2 + time;
                const radius = 100 + Math.sin(time * 2 + i) * 50;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius * 0.5;

                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(59, 130, 246, ${0.6 + Math.sin(time + i) * 0.4})`;
                ctx.fill();
            }

            // Pulsing circles
            for (let i = 0; i < 5; i++) {
                const pulse = Math.sin(time * 3 + i) * 0.5 + 0.5;
                const size = 20 + pulse * 100;
                const x = centerX + Math.cos(time + i) * 200;
                const y = centerY + Math.sin(time + i) * 100;

                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(59, 130, 246, ${pulse * 0.1})`;
                ctx.lineWidth = 1;
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
        <section className={`h-screen snap-start relative w-full flex items-center justify-center ${BLUE_BG_GO}`}>
            {/* Waves Canvas */}
            <canvas ref={wavesCanvasRef} className="absolute inset-0 w-full h-full" />

            {/* Content */}
            <div className="relative z-10 w-full h-full flex flex-col">
                {/* Centered content area */}
                <div className="flex-1 flex flex-col items-center justify-center gap-8">
                    <LandingHeroHeader canvasRef={canvasRef} />
                    <LandingHeroDescription />
                </div>

                {/* Bottom slogan */}
                <div className="pb-20 flex justify-center">
                    <LandingHeroSlogan />
                </div>
            </div>
        </section>
    );
}
