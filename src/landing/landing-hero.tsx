"use client";

import { useEffect, useRef } from "react";

export function LandingHero() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
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

    return (
        <section className="h-screen snap-start relative w-full flex items-center justify-center bg-sky-900">
            {/* Animated Background Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* Content */}
            <div className="relative z-10 text-center space-y-4">
                <h1 className="text-7xl md:text-9xl font-bold tracking-tight drop-shadow-2xl">Adrenalink</h1>
                <p className="text-xl md:text-2xl text-secondary tracking-wide drop-shadow-lg">connecting students and teachers</p>
            </div>
        </section>
    );
}
