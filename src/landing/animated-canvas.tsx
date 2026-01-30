"use client";

import { useEffect, useRef } from "react";

interface AnimatedCanvasProps {
    className?: string;
    mode?: "default" | "campaign";
    color?: string; // Expects rgba or hex
}

export function AnimatedCanvas({ 
    className = "", 
    mode = "default",
    color = "rgba(37, 99, 235, 1)" // Darker blue (blue-600)
}: AnimatedCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let time = 0;
        const introStartTime = Date.now();
        const PARTICLE_DELAY = 2000;
        const PARTICLE_FADE_DURATION = 6000;

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
            const elapsed = Date.now() - introStartTime;

            // Particle/Pulse progress (starts after 10s)
            const extraElapsed = Math.max(0, elapsed - PARTICLE_DELAY);
            const extraProgress = Math.min(extraElapsed / PARTICLE_FADE_DURATION, 1);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Create flowing wave patterns
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Multiple wave layers with different frequencies
            for (let layer = 0; layer < 3; layer++) {
                ctx.beginPath();
                
                // Helper to apply opacity to the color prop
                let strokeColor = color;
                if (color.startsWith("rgba")) {
                    strokeColor = color.replace(/[\d\.]+\)$/, `${0.1 - layer * 0.03})`);
                } else if (color.startsWith("#")) {
                    // Very simple hex to rgba conversion if needed, but assuming rgba for now as per default
                    strokeColor = color + "1a"; // fixed low opacity hex
                }

                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 3;

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

            // Default mode extras (Particles & Pulses)
            if (mode === "default" && extraProgress > 0) {
                const particleColor = color.startsWith("rgba") ? color.replace(/[\d\.]+\)$/, "") : "rgba(59, 130, 246, ";
                
                for (let i = 0; i < 50; i++) {
                    const angle = (i / 50) * Math.PI * 2 + time;
                    const radius = 100 + Math.sin(time * 2 + i) * 50;
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius * 0.5;

                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = `${particleColor}${(0.6 + Math.sin(time + i) * 0.4) * extraProgress})`;
                    ctx.fill();
                }

                // Pulsing circles appearing after 10s
                for (let i = 0; i < 5; i++) {
                    const pulse = Math.sin(time * 3 + i) * 0.5 + 0.5;
                    const size = 20 + pulse * 100;
                    const x = centerX + Math.cos(time + i) * 200;
                    const y = centerY + Math.sin(time + i) * 100;

                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.strokeStyle = `${particleColor}${pulse * 0.1 * extraProgress})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
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
    }, [mode, color]);

    return <canvas ref={canvasRef} className={className} />;
}
